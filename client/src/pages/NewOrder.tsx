import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export default function NewOrder() {
  const [, setLocation] = useLocation();
  const [customerId, setCustomerId] = useState<string>("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [itemNotes, setItemNotes] = useState<string>("");
  
  const { data: customers } = trpc.customers.list.useQuery({});
  const { data: products } = trpc.products.list.useQuery({});
  
  const createMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      toast.success("Pedido criado com sucesso!");
      setLocation(`/orders/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Erro ao criar pedido: ${error.message}`);
    }
  });

  const addItem = () => {
    if (!selectedProduct || quantity <= 0) {
      toast.error("Selecione um produto e quantidade válida");
      return;
    }
    
    const product = products?.find(p => p.id === Number(selectedProduct));
    if (!product) return;
    
    const newItem: OrderItem = {
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      notes: itemNotes || undefined
    };
    
    setItems([...items, newItem]);
    setSelectedProduct("");
    setQuantity(1);
    setItemNotes("");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return subtotal - discount;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId) {
      toast.error("Selecione um cliente");
      return;
    }
    
    if (items.length === 0) {
      toast.error("Adicione pelo menos um item ao pedido");
      return;
    }
    
    createMutation.mutate({
      customerId: Number(customerId),
      items,
      discount,
      notes: notes || undefined,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/orders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Pedido</h1>
          <p className="text-muted-foreground mt-2">Criar um novo pedido</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerId">Cliente *</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map(customer => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="deliveryDate">Data de Entrega</Label>
                <Input
                  id="deliveryDate"
                  type="datetime-local"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adicionar Itens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-5">
                <Label htmlFor="product">Produto</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map(product => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - {formatCurrency(product.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              
              <div className="col-span-4">
                <Label htmlFor="itemNotes">Observações</Label>
                <Input
                  id="itemNotes"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                />
              </div>
              
              <div className="col-span-1 flex items-end">
                <Button type="button" onClick={addItem} className="w-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {items.length > 0 && (
              <div className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Preço Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            {item.notes && (
                              <p className="text-sm text-muted-foreground">{item.notes}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 space-y-2 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="discount">Desconto (R$)</Label>
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={(discount / 100).toFixed(2)}
                      onChange={(e) => setDiscount(Math.round(parseFloat(e.target.value) * 100))}
                      className="w-32"
                    />
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setLocation("/orders")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            Criar Pedido
          </Button>
        </div>
      </form>
    </div>
  );
}
