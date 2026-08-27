using System;
using System.Collections.Generic;
using System.Globalization;
using System.Xml;
using ProcessMiner.Core.Models; // Your new namespace

namespace ProcessMiner.Core
{
    public static class XesParser
    {
        public static IEnumerable<Trace> Parse(string filePath)
        {
            var traces = new List<Trace>();

            // State machine flags to track our current position in the XML tree
            bool inTrace = false;
            bool inEvent = false;

            // Temporary buffers for the current Trace
            string currentTraceId = string.Empty;
            List<LogEvent> tempEvents = new List<LogEvent>();

            // Temporary buffers for the current Event
            DateTime currentEventTimestamp = DateTime.MinValue;
            string currentEventActivity = string.Empty;
            string currentEventResource = string.Empty;
            int currentEventCost = 0;

            // We use XmlReader for sequential streaming of large XML files without memory overflow
            using (XmlReader reader = XmlReader.Create(filePath))
            {
                while (reader.Read())
                {
                    // Triggered when an opening tag is found (e.g., <trace> or <string>)
                    if (reader.NodeType == XmlNodeType.Element)
                    {
                        if (reader.Name == "trace")
                        {
                            inTrace = true;
                            // Set a fallback ID in case the trace has no concept:name attribute
                            currentTraceId = $"Case_{traces.Count + 1}";
                            tempEvents.Clear();
                        }
                        else if (reader.Name == "event" && inTrace)
                        {
                            inEvent = true;
                            // Reset event buffers
                            currentEventTimestamp = DateTime.MinValue;
                            currentEventActivity = "UNKNOWN";
                            currentEventResource = "UNKNOWN";
                            currentEventCost = 0;
                        }
                        else if (reader.Name == "string")
                        {
                            string key = reader.GetAttribute("key");
                            string value = reader.GetAttribute("value");

                            if (key == "concept:name")
                            {
                                if (inEvent)
                                    currentEventActivity = value;
                                else if (inTrace)
                                    currentTraceId = value; // Update the Trace ID if found
                            }
                            else if (key == "org:resource" && inEvent)
                            {
                                currentEventResource = value;
                            }
                        }
                        else if (reader.Name == "date" && inEvent)
                        {
                            string key = reader.GetAttribute("key");
                            string value = reader.GetAttribute("value");

                            if (key == "time:timestamp")
                            {
                                // Parse ISO 8601 date format from XES standard
                                if (DateTime.TryParse(value, null, DateTimeStyles.RoundtripKind, out DateTime parsedDate))
                                {
                                    currentEventTimestamp = parsedDate;
                                }
                            }
                        }
                        else if ((reader.Name == "float" || reader.Name == "int") && inEvent)
                        {
                            string key = reader.GetAttribute("key");
                            string value = reader.GetAttribute("value");

                            // Check for common cost-related keywords in the XES attributes
                            if (key != null && (key.Contains("Amount", StringComparison.OrdinalIgnoreCase) ||
                                                key.Contains("Cost", StringComparison.OrdinalIgnoreCase)))
                            {
                                // Parse as double first to handle <float> tags without crashing, 
                                // then cast to int to match the LogEvent model
                                if (double.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out double parsedCost))
                                {
                                    currentEventCost = (int)parsedCost;
                                }
                            }
                        }
                    }
                    // Triggered when a closing tag is found (e.g., </event> or </trace>)
                    else if (reader.NodeType == XmlNodeType.EndElement)
                    {
                        if (reader.Name == "event" && inEvent)
                        {
                            // Only add the event if it has a valid activity name assigned
                            if (!string.IsNullOrEmpty(currentEventActivity) && currentEventActivity != "UNKNOWN")
                            {
                                // Create the immutable record struct and add it to the buffer
                                tempEvents.Add(new LogEvent(
                                    currentTraceId,
                                    currentEventTimestamp,
                                    currentEventActivity,
                                    currentEventResource,
                                    currentEventCost
                                ));
                            }
                            inEvent = false;
                        }
                        else if (reader.Name == "trace" && inTrace)
                        {
                            if (tempEvents.Count > 0)
                            {
                                // Instantiate the strict Trace class with the required constructor
                                Trace newTrace = new Trace(currentTraceId);

                                foreach (var ev in tempEvents)
                                {
                                    newTrace.Events.Add(new LogEvent(
                                        currentTraceId,
                                        ev.Timestamp,
                                        ev.Activity,
                                        ev.Resource,
                                        ev.Cost
                                    ));
                                }

                                // Sort events chronologically to ensure algorithmic accuracy
                                newTrace.Events.Sort((a, b) => a.Timestamp.CompareTo(b.Timestamp));

                                traces.Add(newTrace);
                            }
                            inTrace = false;
                        }
                    }
                }
            }

            return traces;
        }
    }
}