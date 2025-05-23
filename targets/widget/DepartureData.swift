import Foundation

struct Departure {
    let line: String
    let direction: String
    let time: String
}

struct WidgetData {
    let stationName: String
    let departures: [Departure]
}

class DataProvider {
    static let shared = DataProvider()
    private let userDefaults = UserDefaults(suiteName: "group.com.bez4pieci.departures")

    private init() {}

    func getWidgetData() -> WidgetData {
        let stationName = getStationName()
        let departures = getDepartures()
        return WidgetData(stationName: stationName, departures: departures)
    }

    private func getStationName() -> String {
        guard let jsonString = userDefaults?.string(forKey: "selectedStation"),
              let jsonData = jsonString.data(using: .utf8),
              let stationDict = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any],
              let name = stationDict["name"] as? String else {
            return "Alexanderplatz" // Default fallback
        }
        return name
    }

    private func getDepartures() -> [Departure] {
        guard let jsonString = userDefaults?.string(forKey: "departures"),
              let jsonData = jsonString.data(using: .utf8),
              let dict = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any],
              let departuresArray = dict["departures"] as? [[String: Any]] else {
            return [] // Return empty array if no data
        }

        var departures: [Departure] = []
        let dateFormatter = ISO8601DateFormatter()
        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "HH:mm"

        for departureDict in departuresArray.prefix(5) {
            guard let line = departureDict["line"] as? String,
                  let direction = departureDict["direction"] as? String else {
                continue
            }

            var timeString = "?"
            if let whenString = departureDict["when"] as? String,
               let date = dateFormatter.date(from: whenString) {
                timeString = timeFormatter.string(from: date)
            } else if let plannedWhenString = departureDict["plannedWhen"] as? String,
                      let date = dateFormatter.date(from: plannedWhenString) {
                timeString = timeFormatter.string(from: date)
            }

            departures.append(Departure(line: line, direction: direction, time: timeString))
        }

        return departures
    }
}
