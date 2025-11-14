import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  Clock, 
  DollarSign 
} from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Visão geral do sistema de gestão de pedidos
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total de Clientes",
      value: stats?.totalCustomers || 0,
      icon: Users,
      description: "Clientes cadastrados",
      color: "text-blue-600"
    },
    {
      title: "Total de Produtos",
      value: stats?.totalProducts || 0,
      icon: Package,
      description: "Produtos/serviços ativos",
      color: "text-green-600"
    },
    {
      title: "Total de Pedidos",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      description: "Pedidos realizados",
      color: "text-purple-600"
    },
    {
      title: "Pedidos Pendentes",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      description: "Aguardando processamento",
      color: "text-orange-600"
    },
    {
      title: "Receita Total",
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      description: "Pedidos concluídos",
      color: "text-emerald-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral do sistema de gestão de pedidos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao Sistema de Gestão de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Este sistema permite gerenciar clientes, produtos, serviços e pedidos de forma integrada. 
            Use o menu lateral para navegar entre as diferentes funcionalidades.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
