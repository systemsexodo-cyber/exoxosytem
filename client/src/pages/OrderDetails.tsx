import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  processing: "Em Processamento",
  completed: "Concluído",
  cancelled: "Cancelado"
};

interface OrderDetailsProps {
  id: number;
}

export default function OrderDetails({ id }: OrderDetailsProps) {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  
  const { data: order, isLoading } = trpc.orders.getById.useQuery({ id });
  
  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.orders.getById.invalidate({ id });
      utils.orders.list.invalidate();
      toast.success("Status atualizado com sucesso!");
    }
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!order) {
    return <div className="text-center py-8">Pedido não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/orders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Pedido {order.orderNumber}</h1>
          <p className="text-muted-foreground mt-2">Detalhes do pedido</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium">Número:</span>
              <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Data:</span>
              <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Status:</span>
              <div className="mt-2">
                <Select 
                  value={order.status} 
                  onValueChange={(value) => updateStatusMutation.mutate({ id: order.id, status: value as any })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="processing">Em Processamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {order.deliveryDate && (
              <div>
                <span className="text-sm font-medium">Data de Entrega:</span>
                <p className="text-sm text-muted-foreground">{formatDate(order.deliveryDate)}</p>
              </div>
            )}
            {order.notes && (
              <div>
                <span className="text-sm font-medium">Observações:</span>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.customer ? (
              <>
                <div>
                  <span className="text-sm font-medium">Nome:</span>
                  <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                </div>
                {order.customer.email && (
                  <div>
                    <span className="text-sm font-medium">Email:</span>
                    <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                  </div>
                )}
                {order.customer.phone && (
                  <div>
                    <span className="text-sm font-medium">Telefone:</span>
                    <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                  </div>
                )}
                {order.customer.address && (
                  <div>
                    <span className="text-sm font-medium">Endereço:</span>
                    <p className="text-sm text-muted-foreground">
                      {order.customer.address}
                      {order.customer.city && `, ${order.customer.city}`}
                      {order.customer.state && ` - ${order.customer.state}`}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Cliente não encontrado</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item) => (
                <TableRow key={item.id}>
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
                  <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-destructive">
                <span>Desconto:</span>
                <span>- {formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(order.finalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
