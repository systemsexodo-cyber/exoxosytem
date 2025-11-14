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
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  
  const utils = trpc.useUtils();
  const { data: customers, isLoading } = trpc.customers.list.useQuery({ searchTerm });
  
  const createMutation = trpc.customers.create.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      setIsDialogOpen(false);
      toast.success("Cliente criado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao criar cliente: ${error.message}`);
    }
  });
  
  const updateMutation = trpc.customers.update.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      setIsDialogOpen(false);
      setEditingCustomer(null);
      toast.success("Cliente atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar cliente: ${error.message}`);
    }
  });
  
  const deleteMutation = trpc.customers.delete.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      toast.success("Cliente excluído com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir cliente: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string || "",
      phone: formData.get("phone") as string,
      document: formData.get("document") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zipCode: formData.get("zipCode") as string,
      notes: formData.get("notes") as string,
      active: true,
    };

    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus clientes
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingCustomer?.name}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingCustomer?.email}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={editingCustomer?.phone}
                  />
                </div>
                
                <div>
                  <Label htmlFor="document">CPF/CNPJ</Label>
                  <Input
                    id="document"
                    name="document"
                    defaultValue={editingCustomer?.document}
                  />
                </div>
                
                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    defaultValue={editingCustomer?.zipCode}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={editingCustomer?.address}
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={editingCustomer?.city}
                  />
                </div>
                
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    name="state"
                    maxLength={2}
                    defaultValue={editingCustomer?.state}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    defaultValue={editingCustomer?.notes}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingCustomer ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, telefone ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : customers && customers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email || "-"}</TableCell>
                    <TableCell>{customer.phone || "-"}</TableCell>
                    <TableCell>{customer.city || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={customer.active ? "default" : "secondary"}>
                        {customer.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(customer)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(customer.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum cliente encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
