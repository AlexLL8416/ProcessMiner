using ProcessMiner.Core.Algorithms;
using ProcessMiner.Core.DataGeneration;
using ProcessMiner.Core.Data;
using ProcessMiner.Core.Models;
using ProcessMiner.Core.Export;
using ProcessMiner.Core.Benchmarking;
using System.Diagnostics;


Console.WriteLine("Starting Process Miner Engine\n");

string filePath = "C:\\Users\\usuario\\source\\repos\\ProcessMiner\\ProcessMiner.ConsoleClient\\event_log_test.csv";
string filePath2 = "C:\\Users\\usuario\\source\\repos\\ProcessMiner\\ProcessMiner.ConsoleClient\\stress_log.csv";

//var rawEvents = CsvParser.ParseLazy(filePath);

// Generate stress test dataset
//DataGen dataGen = new DataGen();
//dataGen.GenerateStressTestCSV(filePath2);

// Start measuring time
Stopwatch sw = Stopwatch.StartNew();

// Commented out for testing fast parsing with stress test dataset
//var rawEvents = CsvParser.ParseLazy(filePath2);

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
    trace.Events.Sort((a,b) => a.Timestamp.CompareTo(b.Timestamp));
}

Console.WriteLine($"Processed {tracesDictionary.Count} traces from the event log.");

// Commented out the printing of traces to avoid overwhelming the console with too much data

//foreach (var trace in tracesDictionary.Values) 
//{ 
//    Console.WriteLine($"\n Trace {trace.CaseId}: {trace.Events.Count} events");
//    foreach (var logEvent in trace.Events)
//    {
//        Console.WriteLine($"  Event: {logEvent.Activity} at {logEvent.Timestamp} by {logEvent.Resource} with cost {logEvent.Cost}");
//    }
//}

// Now, we can build the footprint matrix using the Alpha Miner algorithm
Console.WriteLine("\n\nBuilding footprint matrix...");
var alphaMiner = new AlphaMiner(tracesDictionary.Values);

Console.WriteLine("Footprint matrix built successfully:\n");
Console.WriteLine(alphaMiner.PrintMatrix());

// Export to Graphviz DOT format
Console.WriteLine("\n\nExporting to Graphviz...\n");
var dot = GraphvizExporter.ExportToDot(alphaMiner.Activities, alphaMiner.FootprintMatrix);
Console.WriteLine(dot);

// Export to Graphviz DOT format with performance metrics
var umbral = TimeSpan.FromHours(1); // Example threshold for bottleneck
var costThreshold = 20.0; // Example threshold for high-cost activities
string dotWithPerformance = GraphvizExporter.ExportToDotWithPerformance(alphaMiner.Activities, alphaMiner.FootprintMatrix, alphaMiner.AverageTrasitionTime, umbral, alphaMiner.AverageActivityCost, costThreshold);
Console.WriteLine("\n\nExporting to Graphviz with performance metrics...\n");
Console.WriteLine(dotWithPerformance);

// Resource Mining
var resourceMining = new ResourceMining(tracesDictionary.Values);
var dotSocialGraph = GraphvizExporter.ExportToDotSocialGraph(resourceMining.HandoverMatrix, resourceMining.Resources);
Console.WriteLine("\n\nExporting to Social Graph...\n");
Console.WriteLine(dotSocialGraph);

sw.Stop();

Console.WriteLine("\n\nExecution time: {0} ms", sw.ElapsedMilliseconds);


/*

Commented out for testing purposes of BenchmarkService because the analisys have already been done and the results are in the BenchmarkingResults.txt file

// Benchmarking the parsing methods and the entire pipeline 5 times to get an average execution time
for (int i = 0; i < 5; i++)
{
    var benchmarkService = new BenchmarkService();
    benchmarkService.RunBenchmark();
}
*/
