import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye } from "lucide-react";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  processing: "Em Processamento",
  completed: "Concluído",
  cancelled: "Cancelado"
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  confirmed: "default",
  processing: "default",
  completed: "default",
  cancelled: "destructive"
};

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  const { data: orders, isLoading } = trpc.orders.list.useQuery({ 
    status: statusFilter || undefined 
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground mt-2">Gerencie todos os pedidos</p>
        </div>
        
        <Link href="/orders/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Pedido
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Pedidos</CardTitle>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="processing">Em Processamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : orders && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente ID</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customerId}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{formatCurrency(order.finalAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/orders/${order.id}`}>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">Nenhum pedido encontrado</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
