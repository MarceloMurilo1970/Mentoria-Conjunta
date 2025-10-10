import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { Registration } from "@shared/schema";

export default function AdminPage() {
  const { data: registrations, isLoading, error } = useQuery<Registration[]>({
    queryKey: ['/api/registrations'],
  });

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

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Inscrições - Mentoria Marcelo Murilo & Hamilton Felix</CardTitle>
          <CardDescription>
            Total de {registrations?.length || 0} inscrições registradas
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
                    <TableHead>Data de Inscrição</TableHead>
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
                            ? 'PIX (R$ 6.975)' 
                            : '5x R$ 1.500 (Cartão)'}
                        </Badge>
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
