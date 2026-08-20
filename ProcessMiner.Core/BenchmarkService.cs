using ProcessMiner.Core.Models;
using ProcessMiner.Core.Data;
using ProcessMiner.Core.Algorithms;


namespace ProcessMiner.Core.Benchmarking
{
    public class BenchmarkService
    {


        int[] sizes = { 1000, 10000, 100000, 1000000, 5000000, 10000000 };
        string filePath = @"C:\Users\usuario\source\repos\ProcessMiner\ProcessMiner.Core\benchmark_temp.csv";

        private long MeasureExecutionTime(Action parseAction)
        {
            GC.Collect();
            GC.WaitForPendingFinalizers();
            GC.Collect();

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            parseAction();
            stopwatch.Stop();
            return stopwatch.ElapsedMilliseconds;
        }

        private void ConsumeAllEvents(IEnumerable<LogEvent> events)
        {
            foreach (var logEvent in events)
            {
                // Consume the event to ensure the parsing is fully executed
                var _ = logEvent.CaseId;
            }
        }

        private void RunPipeline(string filePath, Func<string, IEnumerable<LogEvent>> parseMethod)
        // This method runs the entire pipeline: parsing, creating traces, and building the footprint matrix
        {

            var rawEvents = parseMethod(filePath);

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

            var miner = new AlphaMiner(tracesDictionary.Values);

            // Save the footprint matrix to a string to make sure it's computed and can be used later if needed
            string matrixOutput = miner.PrintMatrix();
        }

        public void RunBenchmark()
        {

            Console.WriteLine("Starting Benchmarking...");

            // Warm up the JIT compiler by running both parsing methods once before measuring
            DataGeneration.DataGen dataGen = new DataGeneration.DataGen();
            dataGen.GenerateStressTestCSV(filePath, 100); // Generate a small dataset for warm-up
            ConsumeAllEvents(CsvParser.LazyParse(filePath));
            ConsumeAllEvents(CsvParser.FastParse(filePath));
            Console.WriteLine("Warm-up completed.\n");

            // Header for the benchmark results
            Console.WriteLine("| {0,-10} | {1,-12} | {2,-12} | {3,-12} | {4,-11} | {5,-11} | {6,-11} | {7,-11} | {8,-12} | {9,-12} | {10,-13} | {11,-12} | {12,-14} |",
                "Rows", "Parse Lazy", "Parse Fast", "Parse FC", "Diff Fast", "Imp Fast %", "Diff FC", "Imp FC %", "Pipe Lazy", "Pipe Fast", "Pipe Imp F %", "Pipe FC", "Pipe Imp FC %");
            Console.WriteLine(new string('-', 95));

            foreach (var size in sizes)
            {
                // Generate the dataset
                dataGen.GenerateStressTestCSV(filePath, size);

                // Measure Lazy Parsing
                long lazyTime = MeasureExecutionTime(() =>
                {
                    var lazyEvents = CsvParser.LazyParse(filePath);
                    ConsumeAllEvents(lazyEvents);
                });

                // Measure Fast Parsing without caching
                long fastTime = MeasureExecutionTime(() =>
                {
                    var fastEvents = CsvParser.FastParse(filePath);
                    ConsumeAllEvents(fastEvents);
                });

                // Measure Fast Parsing with caching
                long fastCacheTime = MeasureExecutionTime(() =>
                {
                    var fastCacheEvents = CsvParser.FastParseCache(filePath);
                    ConsumeAllEvents(fastCacheEvents);
                });

                // Measure the entire pipeline execution time using different parsing methods
                long pipelineTimeLazy = MeasureExecutionTime(() =>
                {
                    RunPipeline(filePath, CsvParser.LazyParse);
                });
                long pipelineTimeFast = MeasureExecutionTime(() =>
                {
                    RunPipeline(filePath, CsvParser.FastParse);
                });
                long pipelineTimeFastCache = MeasureExecutionTime(() =>
                {
                    RunPipeline(filePath, CsvParser.FastParseCache);
                });

                // Calculate the difference and improvement in parsing
                long diff = lazyTime - fastTime;
                double improvement = lazyTime > 0 ? (double)diff / lazyTime * 100 : 0;

                long diffCache = lazyTime - fastCacheTime;
                double improvementCache = lazyTime > 0 ? (double)diffCache / lazyTime * 100 : 0;

                long diffPipeline = pipelineTimeLazy - pipelineTimeFast;
                double improvementPipeline = pipelineTimeLazy > 0 ? (double)diffPipeline / pipelineTimeLazy * 100 : 0;

                long diffPipelineCache = pipelineTimeLazy - pipelineTimeFastCache;
                double improvementPipelineCache = pipelineTimeLazy > 0 ? (double)diffPipelineCache / pipelineTimeLazy * 100 : 0;

                Console.WriteLine("| {0,-10:N0} | {1,-9} ms | {2,-9} ms | {3,-9} ms | {4,-8} ms | {5,-9:F2} % | {6,-8} ms | {7,-9:F2} % | {8,-9} ms | {9,-9} ms | {10,-11:F2} % | {11,-9} ms | {12,-12:F2} % |",
                    size, lazyTime, fastTime, fastCacheTime, diff, improvement, diffCache, improvementCache, pipelineTimeLazy, pipelineTimeFast, improvementPipeline, pipelineTimeFastCache, improvementPipelineCache);

            }
        }

    }
}
