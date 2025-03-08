import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const SupabaseTest = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Verificar se as variáveis de ambiente estão definidas
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          setStatus("error");
          setMessage(
            "Variáveis de ambiente VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não definidas",
          );
          return;
        }

        // Testar a conexão com o Supabase
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .limit(5);

        if (error) {
          throw error;
        }

        setEvents(data || []);
        setStatus("success");
        setMessage(
          `Conexão bem-sucedida! ${data?.length || 0} eventos encontrados.`,
        );
      } catch (error: any) {
        console.error("Erro ao testar conexão com Supabase:", error);
        setStatus("error");
        setMessage(`Erro: ${error.message || "Desconhecido"}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Teste de Conexão Supabase</h2>

      {status === "loading" && (
        <div className="text-gray-600">Testando conexão...</div>
      )}

      {status === "success" && (
        <div className="text-green-600">
          <p className="mb-2">{message}</p>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Primeiros eventos:</h3>
            {events.length > 0 ? (
              <ul className="list-disc pl-5">
                {events.map((event) => (
                  <li key={event.id} className="mb-1">
                    {event.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum evento encontrado.</p>
            )}
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="text-red-600">
          <p className="mb-2">{message}</p>
          <p className="text-sm mt-2">
            Verifique o console para mais detalhes.
          </p>
        </div>
      )}
    </div>
  );
};

export default SupabaseTest;
