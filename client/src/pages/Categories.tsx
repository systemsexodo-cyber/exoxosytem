import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Categories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.categories.list.useQuery();
  
  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      setIsDialogOpen(false);
      toast.success("Categoria criada!");
    }
  });
  
  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      setIsDialogOpen(false);
      setEditingCategory(null);
      toast.success("Categoria atualizada!");
    }
  });
  
  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success("Categoria excluída!");
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground mt-2">Gerencie categorias de produtos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingCategory(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nova Categoria</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" name="name" defaultValue={editingCategory?.name} required />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" name="description" defaultValue={editingCategory?.description} rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingCategory ? "Atualizar" : "Criar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="text-center py-8">Carregando...</div> : categories && categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => { setEditingCategory(category); setIsDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => confirm("Excluir?") && deleteMutation.mutate({ id: category.id })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <div className="text-center py-8">Nenhuma categoria encontrada</div>}
        </CardContent>
      </Card>
    </div>
  );
}
