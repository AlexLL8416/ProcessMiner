namespace ProcessMiner.Core.Data;

using System.Globalization;
using System.IO;
using System.Collections.Generic;
using System;
using ProcessMiner.Core.Models;

public class CsvParser
{

    public static IEnumerable<LogEvent> LazyParse(string filePath)
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

        /*
        
        Commented out code for cache beacuse it is less efficient than the current implementation, but it is kept here for reference.

        // Cache for string interning to reduce memory usage
        var stringPool = new List<string>();

        // Helper method to get a pooled string, by using ReadOnlySpan<char> they are avoided unnecessary allocations
        string GetPooledString(ReadOnlySpan<char> span) 
        { 
            for (int i = 0;i < stringPool.Count; i++)
            {
                if (stringPool[i].AsSpan().SequenceEqual(span))
                {
                    return stringPool[i];
                }
            }

            // Only create a new string if it doesn't exist in the pool
            string newString = span.ToString();
            stringPool.Add(newString);
            return newString;
        }
        */

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

    public static IEnumerable<LogEvent> FastParseCache(string filePath)
    {
        using var reader = new StreamReader(filePath);
        reader.ReadLine();

        // Cache for string interning to reduce memory usage
        var stringPool = new List<string>();

        // Helper method to get a pooled string, by using ReadOnlySpan<char> they are avoided unnecessary allocations
        string GetPooledString(ReadOnlySpan<char> span) 
        { 
            for (int i = 0;i < stringPool.Count; i++)
            {
                if (stringPool[i].AsSpan().SequenceEqual(span))
                {
                    return stringPool[i];
                }
            }

            // Only create a new string if it doesn't exist in the pool
            string newString = span.ToString();
            stringPool.Add(newString);
            return newString;
        }
        

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
            string activity = GetPooledString(span.Slice(0, comma3));
            span = span.Slice(comma3 + 1);

            // Resource
            int comma4 = span.IndexOf(",");
            string resource = GetPooledString(span.Slice(0, comma4));
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

    public static IEnumerable<Trace> ParseAndOrdering(string filePath) 
    {
        var rawEvents = CsvParser.FastParseCache(filePath);

        var tracesDictionary = new Dictionary<string, ProcessMiner.Core.Models.Trace>();

        // Group events by CaseId and create traces
        foreach (var rawEvent in rawEvents)
        {
            if (!tracesDictionary.TryGetValue(rawEvent.CaseId, out var trace))
            {
                trace = new ProcessMiner.Core.Models.Trace(rawEvent.CaseId);
                tracesDictionary[rawEvent.CaseId] = trace;
            }
            trace.Events.Add(rawEvent);
        }

        // Sort events in each trace by timestamp
        foreach (var trace in tracesDictionary.Values)
        {
            trace.Events.Sort((a, b) => a.Timestamp.CompareTo(b.Timestamp));
        }

        return tracesDictionary.Values;
    }

}
