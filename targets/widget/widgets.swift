import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), widgetData: WidgetData(stationName: "Station", departures: [
            Departure(line: "U1", direction: "Warschauer Str.", time: "12:34"),
            Departure(line: "S7", direction: "Ahrensfelde", time: "12:37")
        ]))
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let widgetData = DataProvider.shared.getWidgetData()
        let entry = SimpleEntry(date: Date(), widgetData: widgetData)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> ()) {
        let widgetData = DataProvider.shared.getWidgetData()
        let entry = SimpleEntry(date: Date(), widgetData: widgetData)

        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 2, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let widgetData: WidgetData
}

struct DeparturesWidgetEntryView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            // Header
            HStack {
                Text(entry.widgetData.stationName)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.primary)
                    .lineLimit(1)

                Spacer()

                Text(entry.date, style: .time)
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundColor(.secondary)
            }

            Divider()

            // Departures
            VStack(alignment: .leading, spacing: 2) {
                ForEach(Array(entry.widgetData.departures.prefix(family == .systemSmall ? 3 : 5).enumerated()), id: \.offset) { _, departure in
                    DepartureRowView(departure: departure)
                }
            }

            Spacer()
        }
        .padding(8)
    }
}

struct DepartureRowView: View {
    let departure: Departure

    var body: some View {
        HStack(spacing: 6) {
            Text(departure.time)
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .frame(width: 35, alignment: .leading)

            Text(departure.line)
                .font(.system(size: 11, weight: .bold))
                .frame(width: 25, alignment: .leading)

            Text(departure.direction)
                .font(.system(size: 9))
                .foregroundColor(.secondary)
                .lineLimit(1)
        }
    }
}

struct DeparturesWidget: Widget {
    let kind: String = "DeparturesWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            DeparturesWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Departures")
        .description("Shows upcoming departures from your selected station")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

#Preview(as: .systemSmall) {
    DeparturesWidget()
} timeline: {
    SimpleEntry(date: Date(), widgetData: WidgetData(stationName: "Alexanderplatz", departures: [
        Departure(line: "U1", direction: "Warschauer Str.", time: "12:34"),
        Departure(line: "S7", direction: "Ahrensfelde", time: "12:37")
    ]))
}
