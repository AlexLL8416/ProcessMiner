using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProcessMiner.Core.DataGeneration
{
    public class DataGen
    {
        public void GenerateStressTestCSV(string outputPath,int n)
        {
            using var writer = new StreamWriter(outputPath);
            writer.WriteLine("Case_ID,Timestamp,Activity,Resource,Cost");

            var startTime = new DateTime(2026, 1, 1);
            var rand = new Random();

            // n test cases, each with a sequence of events
            for (int i = 1; i <= n; i++)
            {
                var time = startTime.AddMinutes(i * 10);
                string caseId = $"C_{i}";

                // All cases start the same
                writer.WriteLine($"{caseId},{time:yyyy-MM-dd HH:mm:ss},Recibir_Solicitud,Sistema,0");
                time = time.AddMinutes(5);
                writer.WriteLine($"{caseId},{time:yyyy-MM-dd HH:mm:ss},Verificacion_Automatica,API,2");

                // Introduce randomness for concurrency
                if (rand.Next(2) == 0)
                {
                    time = time.AddMinutes(2); writer.WriteLine($"{caseId},{time:yyyy-MM-dd HH:mm:ss},Comprobar_Antecedentes,API,1");
                    time = time.AddMinutes(2); writer.WriteLine($"{caseId},{time:yyyy-MM-dd HH:mm:ss},Calculo_Scoring,API,1");
                }
                else
                {
                    time = time.AddMinutes(2); writer.WriteLine($"{caseId},{time:yyyy-MM-dd HH:mm:ss},Calculo_Scoring,API,1");
                    time = time.AddMinutes(2); writer.WriteLine($"{caseId},{time:yyyy-MM-dd HH:mm:ss},Comprobar_Antecedentes,API,1");
                }

                // Introduce randomness for the end of the process
                int outcome = rand.Next(100);
                if (outcome < 70) // 70% Happy Path
                {
                    time = time.AddMinutes(5); writer.WriteLine($"{caseId},{time:yyyy-MM-dd HH:mm:ss},Aprobacion_Automatica,Sistema,0");
                    time = time.AddMinutes(5); writer.WriteLine($"{caseId},{time:yyyy-MM-dd HH:mm:ss},Emitir_Transferencia,Banco,5");
                }
                else if (outcome < 90) // 20% Manual Revision
                {
                    time = time.AddMinutes(5); writer.WriteLine($"{caseId},{time:yyyy-MM-dd HH:mm:ss},Requiere_Revision_Manual,Sistema,0");
                    time = time.AddHours(2); writer.WriteLine($"{caseId},{time:yyyy-MM-dd HH:mm:ss},Analisis_Riesgo_Manual,Empleado,50");
                    time = time.AddMinutes(30); writer.WriteLine($"{caseId},{time:yyyy-MM-dd HH:mm:ss},Aprobacion_Manual,Empleado,0");
                }
                else // 10% Rejection
                {
                    time = time.AddMinutes(5); writer.WriteLine($"{caseId},{time:yyyy-MM-dd HH:mm:ss},Requiere_Revision_Manual,Sistema,0");
                    time = time.AddHours(2); writer.WriteLine($"{caseId},{time:yyyy-MM-dd HH:mm:ss},Analisis_Riesgo_Manual,Empleado,50");
                    time = time.AddMinutes(30); writer.WriteLine($"{caseId},{time:yyyy-MM-dd HH:mm:ss},Rechazo_Manual,Empleado,0");
                }
            }
        }
    }
}
