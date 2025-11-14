import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.products.list.useQuery({ searchTerm });
  const { data: categories } = trpc.categories.list.useQuery();
  
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      setIsDialogOpen(false);
      toast.success("Produto criado com sucesso!");
    }
  });
  
  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      setIsDialogOpen(false);
      setEditingProduct(null);
      toast.success("Produto atualizado com sucesso!");
    }
  });
  
  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      toast.success("Produto excluído com sucesso!");
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const priceStr = formData.get("price") as string;
    const price = Math.round(parseFloat(priceStr) * 100);
    
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      sku: formData.get("sku") as string,
      categoryId: formData.get("categoryId") ? Number(formData.get("categoryId")) : undefined,
      type: formData.get("type") as "product" | "service",
      price,
      unit: formData.get("unit") as string,
      active: true,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos e Serviços</h1>
          <p className="text-muted-foreground mt-2">Gerencie produtos e serviços</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingProduct(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Produto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" name="name" defaultValue={editingProduct?.name} required />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" name="description" defaultValue={editingProduct?.description} rows={3} />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" name="sku" defaultValue={editingProduct?.sku} />
                </div>
                <div>
                  <Label htmlFor="categoryId">Categoria</Label>
                  <Select name="categoryId" defaultValue={editingProduct?.categoryId?.toString()}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {categories?.map(cat => <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select name="type" defaultValue={editingProduct?.type || "product"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Produto</SelectItem>
                      <SelectItem value="service">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input id="price" name="price" type="number" step="0.01" defaultValue={editingProduct ? (editingProduct.price / 100).toFixed(2) : ""} required />
                </div>
                <div>
                  <Label htmlFor="unit">Unidade *</Label>
                  <Input id="unit" name="unit" defaultValue={editingProduct?.unit || "un"} required />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingProduct ? "Atualizar" : "Criar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="text-center py-8">Carregando...</div> : products && products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku || "-"}</TableCell>
                    <TableCell><Badge variant="outline">{product.type === "product" ? "Produto" : "Serviço"}</Badge></TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell><Badge variant={product.active ? "default" : "secondary"}>{product.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => { setEditingProduct(product); setIsDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => confirm("Excluir?") && deleteMutation.mutate({ id: product.id })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <div className="text-center py-8">Nenhum produto encontrado</div>}
        </CardContent>
      </Card>
    </div>
  );
}
