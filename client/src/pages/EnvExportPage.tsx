import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Eye, EyeOff, Lock } from "lucide-react";

export default function EnvExportPage() {
  const [token, setToken] = useState("");
  const [vars, setVars] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  async function fetchVars() {
    if (!token.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/env-vars?token=${encodeURIComponent(token)}`);
      if (!res.ok) {
        setError("Acesso negado. Verifique o SESSION_SECRET.");
        setVars(null);
      } else {
        const data = await res.json();
        setVars(data);
      }
    } catch {
      setError("Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    if (!vars) return;
    const text = Object.entries(vars)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleReveal(key: string) {
    setRevealed(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function copyOne(value: string) {
    navigator.clipboard.writeText(value);
  }

  const sensitiveKeys = ["SECRET", "PASSWORD", "KEY", "TOKEN", "URL", "PASS"];
  function isSensitive(key: string) {
    return sensitiveKeys.some(s => key.toUpperCase().includes(s));
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Exportar Variáveis de Ambiente</h1>
          <p className="text-muted-foreground mt-1 text-sm">Acesso restrito — insira o SESSION_SECRET para continuar</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="token-input" className="text-sm mb-2 block">SESSION_SECRET</Label>
                <Input
                  id="token-input"
                  data-testid="input-token"
                  type="password"
                  placeholder="Cole o valor do SESSION_SECRET aqui..."
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && fetchVars()}
                />
              </div>
              <div className="flex items-end">
                <Button
                  data-testid="button-fetch"
                  onClick={fetchVars}
                  disabled={loading || !token.trim()}
                >
                  {loading ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </div>
            {error && (
              <p className="text-destructive text-sm mt-3">{error}</p>
            )}
          </CardContent>
        </Card>

        {vars && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
              <CardTitle className="text-base">
                {Object.keys(vars).length} variáveis encontradas
              </CardTitle>
              <Button
                data-testid="button-copy-all"
                size="sm"
                onClick={copyAll}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar todas (.env)
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {Object.entries(vars)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([key, value]) => {
                    const sensitive = isSensitive(key);
                    const isVisible = revealed[key] || !sensitive;
                    return (
                      <div
                        key={key}
                        data-testid={`row-env-${key}`}
                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50 group"
                      >
                        <span className="font-mono text-xs font-semibold text-primary w-52 shrink-0 truncate">
                          {key}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground flex-1 truncate">
                          {isVisible ? value : "••••••••••••"}
                        </span>
                        <div className="flex gap-1 shrink-0">
                          {sensitive && (
                            <Button
                              size="icon"
                              variant="ghost"
                              data-testid={`button-reveal-${key}`}
                              onClick={() => toggleReveal(key)}
                            >
                              {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            data-testid={`button-copy-${key}`}
                            onClick={() => copyOne(value)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Ao clicar em "Copiar todas", o conteúdo é copiado no formato <code className="text-primary">.env</code> (CHAVE=valor), pronto para uso.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
