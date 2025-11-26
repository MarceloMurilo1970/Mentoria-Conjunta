import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Registration } from "@shared/schema";

export default function AdminPage() {
  const { toast } = useToast();

  const { data: registrations, isLoading, error } = useQuery<Registration[]>({
    queryKey: ['/api/registrations'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/registrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      toast({
        title: "Inscrição excluída",
        description: "A inscrição foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a inscrição.",
        variant: "destructive",
      });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async ({ id, received }: { id: string; received: boolean }) => {
      await apiRequest("PATCH", `/api/registrations/${id}/payment`, { received });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      toast({
        title: "Status atualizado",
        description: "O status do pagamento foi atualizado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a inscrição de "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleTogglePayment = (id: string, currentStatus: boolean) => {
    paymentMutation.mutate({ id, received: !currentStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar inscrições</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const paidCount = registrations?.filter(r => r.paymentReceived).length || 0;
  const totalCount = registrations?.length || 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Inscrições - Mentoria Marcelo Murilo & Hamilton Felix</CardTitle>
          <CardDescription className="flex gap-4 flex-wrap">
            <span>Total de {totalCount} inscrições registradas</span>
            <span className="text-green-600 font-medium">{paidCount} pagamentos confirmados</span>
            <span className="text-yellow-600 font-medium">{totalCount - paidCount} aguardando pagamento</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registrations && registrations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Status Pagamento</TableHead>
                    <TableHead>Data de Inscrição</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg, index) => (
                    <TableRow key={reg.id} data-testid={`row-registration-${index}`}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{reg.name}</TableCell>
                      <TableCell>{reg.email}</TableCell>
                      <TableCell>{reg.phone}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={reg.paymentMethod === 'pix' ? 'default' : 'secondary'}
                          data-testid={`badge-payment-${index}`}
                        >
                          {reg.paymentMethod === 'pix' 
                            ? 'PIX (R$ 8.000)' 
                            : '5x R$ 1.750 (Cartão)'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={reg.paymentReceived ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleTogglePayment(reg.id, reg.paymentReceived)}
                          disabled={paymentMutation.isPending}
                          data-testid={`button-payment-${index}`}
                          className={reg.paymentReceived 
                            ? "bg-green-600 hover:bg-green-700" 
                            : "border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                          }
                        >
                          {reg.paymentReceived ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Pago
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              Pendente
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {new Date(reg.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(reg.id, reg.name)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${index}`}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma inscrição registrada ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
