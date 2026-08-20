namespace ProcessMiner.Core.Data;

using System.Globalization;
using ProcessMiner.Core.Models;

public class CsvParser
{

    public static IEnumerable<LogEvent> ParseLazy(string filePath)
    { 
        using var reader = new StreamReader(filePath);

        reader.ReadLine(); // Skip header line

        while (!reader.EndOfStream)
        {
            var line = reader.ReadLine();
            if (line == null) continue;
            var values = line.Split(',');
            if (values.Length < 5) continue; // Skip lines with insufficient data
            var logEvent = new LogEvent
            {
                CaseId = values[0],
                Timestamp = DateTime.ParseExact(values[1], "yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture),
                Activity = values[2],
                Resource = values[3],
                Cost = int.TryParse(values[4], out var cost) ? cost : 0
            };
            yield return logEvent;
        }
    }

    public static IEnumerable<LogEvent> FastParse(string filePath) 
    { 
        using var reader = new StreamReader(filePath);
        reader.ReadLine();

        string? line;
        while ((line = reader.ReadLine()) != null)
        {
            if (line == null) continue;
            ReadOnlySpan<char> span = line.AsSpan();

            // CaseId
            int comma1 = span.IndexOf(",");
            string caseId = span.Slice(0, comma1).ToString();
            span = span.Slice(comma1 + 1);

            // Timestamp
            int comma2 = span.IndexOf(",");
            DateTime timestampStr = DateTime.ParseExact(span.Slice(0, comma2).ToString(), "yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);
            span = span.Slice(comma2 + 1);

            // Activity
            int comma3 = span.IndexOf(",");
            string activity = span.Slice(0, comma3).ToString();
            span = span.Slice(comma3 + 1);

            // Resource
            int comma4 = span.IndexOf(",");
            string resource = span.Slice(0, comma4).ToString();
            span = span.Slice(comma4 + 1);

            // Cost
            int cost = int.TryParse(span.ToString(), out var parsedCost) ? parsedCost : 0;

            yield return new LogEvent
            {
                CaseId = caseId,
                Timestamp = timestampStr,
                Activity = activity,
                Resource = resource,
                Cost = cost
            };
        }
    }

}
