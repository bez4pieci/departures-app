import { parse as parseContentType } from 'content-type'
import stringifyQuery from 'qs/lib/stringify.js'
import type {
    Arrivals,
    BoundingBox,
    Departures,
    DeparturesArrivalsOptions,
    DurationsWithRealtimeData,
    HafasClient,
    Journeys,
    JourneysFromTripOptions,
    JourneysOptions,
    JourneyWithRealtimeData,
    LinesOptions,
    LinesWithRealtimeData,
    Location,
    LocationsOptions,
    NearByOptions,
    Radar,
    RadarOptions,
    ReachableFromOptions,
    RefreshJourneyOptions,
    RemarksOptions,
    ServerInfo,
    ServerOptions,
    Station,
    Stop,
    StopOptions,
    StopOver,
    TripOptions,
    TripsByNameOptions,
    TripsWithRealtimeData,
    TripWithRealtimeData,
    WarningsWithRealtimeData
} from 'hafas-client'

const RESPONSE = Symbol('Response')
const HEADERS = Symbol('Response.headers')
const SERVER_TIMING = Symbol('Server-Timing header')
const CACHE = Symbol('X-Cache header')

type RequestOptions = {
    headers?: Record<string, string>;
    method?: string;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    [key: string]: any;
}

type RequestQuery = Record<string, any>

interface ErrorWithResponse extends Error {
    response?: Response;
    body?: any;
}

export default function createClient(endpoint: string, opt: { userAgent?: string } = {}): HafasClient {
    new URL(endpoint); // throws if endpoint URL is invalid

    const {
        userAgent,
    } = {
        userAgent: 'hafas-rest-api-client',
        ...opt
    }

    const request = async <T>(path: string, query: RequestQuery = {}, opt: RequestOptions = {}): Promise<T> => {
        const url = new URL(path, endpoint)

        const searchParams = stringifyQuery(Object.fromEntries([
            ...url.searchParams.entries(),
            ...Object.entries(query),
        ]), { allowDots: true })

        const headers = {
            'Accept': 'application/json',
            'User-Agent': userAgent,
            ...(opt.headers || {}),
        }

        const cfg: RequestInit = {
            method: 'GET',
            mode: 'cors' as RequestMode,
            redirect: 'follow' as RequestRedirect,
            headers,
            ...opt,
        }

        // Append search params to URL
        if (searchParams) {
            url.search = searchParams
        }

        let res: Response
        try {
            res = await fetch(url.href, cfg)
            if (!res.ok) {
                const error = new Error(`HTTP error! status: ${res.status}`) as ErrorWithResponse
                error.response = res
                throw error
            }
        } catch (err: any) {
            // parse JSON body, attach to error object
            try {
                const headers = err.response && err.response.headers
                const cType = headers && headers.get('content-type')
                if (cType && parseContentType(cType).type === 'application/json') {
                    err.body = await err.response.json()
                    if (err.body.msg) err.message += ' – ' + err.body.msg
                }
                // eslint-disable-next-line no-empty
            } catch (_) { }
            throw err
        }

        const body = await res.json() as T & {
            [RESPONSE]?: Response;
            [HEADERS]?: Headers;
            [SERVER_TIMING]?: string | null;
            [CACHE]?: string | null;
        }
        Object.defineProperty(body, RESPONSE, { value: res })
        Object.defineProperty(body, HEADERS, { value: res.headers })
        Object.defineProperty(body, SERVER_TIMING, {
            value: res.headers.get('Server-Timing') || null,
        })
        Object.defineProperty(body, CACHE, {
            value: res.headers.get('X-Cache') || null,
        })
        return body
    }

    const locations = async (query: string, opt?: LocationsOptions): Promise<readonly (Station | Stop | Location)[]> => {
        return await request<readonly (Station | Stop | Location)[]>('/locations', {
            query,
            ...opt,
        })
    }

    const nearby = async (loc: Location, opt?: NearByOptions): Promise<readonly (Station | Stop | Location)[]> => {
        return await request<readonly (Station | Stop | Location)[]>('/stops/nearby', {
            ...loc,
            ...opt,
        })
    }

    const reachableFrom = async (loc: Location, opt?: ReachableFromOptions): Promise<DurationsWithRealtimeData> => {
        return await request<DurationsWithRealtimeData>('/stops/reachable-from', {
            ...loc,
            ...opt,
        })
    }

    const stop = async (id: string | Stop, opt?: StopOptions): Promise<Station | Stop | Location> => {
        if (!id) throw new TypeError('invalid id')
        const stopId = typeof id === 'string' ? id : id.id
        if (!stopId) throw new TypeError('invalid stop id')
        return await request<Station | Stop | Location>('/stops/' + encodeURIComponent(stopId), opt)
    }

    const departures = async (station: string | Station | Stop | Location, options?: DeparturesArrivalsOptions): Promise<Departures> => {
        if (!station) throw new TypeError('invalid station')
        const stopId = typeof station === 'string' ? station : station.id
        if (!stopId) throw new TypeError('invalid station id')
        return await request<Departures>(`/stops/${encodeURIComponent(stopId)}/departures`, options)
    }

    const arrivals = async (station: string | Station | Stop | Location, options?: DeparturesArrivalsOptions): Promise<Arrivals> => {
        if (!station) throw new TypeError('invalid station')
        const stopId = typeof station === 'string' ? station : station.id
        if (!stopId) throw new TypeError('invalid station id')
        return await request<Arrivals>(`/stops/${encodeURIComponent(stopId)}/arrivals`, options)
    }

    const journeys = async (from: string | Station | Stop | Location, to: string | Station | Stop | Location, opt?: JourneysOptions): Promise<Journeys> => {
        return await request<Journeys>('/journeys', {
            from, to,
            ...opt,
        })
    }

    const refreshJourney = async (ref: string, opt?: RefreshJourneyOptions): Promise<JourneyWithRealtimeData> => {
        if (!ref) throw new TypeError('invalid ref')
        return await request<JourneyWithRealtimeData>('/journeys/' + encodeURIComponent(ref), opt)
    }

    const trip = async (id: string, opt?: TripOptions): Promise<TripWithRealtimeData> => {
        if (!id) throw new TypeError('invalid id')
        return await request<TripWithRealtimeData>('/trips/' + encodeURIComponent(id), opt)
    }

    const radar = async (bbox: BoundingBox, opt?: RadarOptions): Promise<Radar> => {
        return await request<Radar>('/radar', {
            ...bbox,
            ...opt,
        })
    }

    const tripsByName = async (lineNameOrFahrtNr: string, opt?: TripsByNameOptions): Promise<TripsWithRealtimeData> => {
        return await request<TripsWithRealtimeData>('/trips/by-name', {
            lineNameOrFahrtNr,
            ...opt,
        })
    }

    const remarks = async (opt?: RemarksOptions): Promise<WarningsWithRealtimeData> => {
        return await request<WarningsWithRealtimeData>('/remarks', opt)
    }

    const lines = async (query: string, opt?: LinesOptions): Promise<LinesWithRealtimeData> => {
        return await request<LinesWithRealtimeData>('/lines', {
            query,
            ...opt,
        })
    }

    const serverInfo = async (opt?: ServerOptions): Promise<ServerInfo> => {
        return await request<ServerInfo>('/server-info', opt)
    }

    const journeysFromTrip = async (fromTripId: string, previousStopover: StopOver, to: string | Station | Stop | Location, opt?: JourneysFromTripOptions): Promise<Journeys> => {
        return await request<Journeys>('/journeys/from-trip', {
            fromTripId,
            previousStopover,
            to,
            ...opt,
        })
    }

    return {
        locations,
        nearby,
        reachableFrom,
        stop,
        departures,
        arrivals,
        journeys,
        refreshJourney,
        trip,
        radar,
        tripsByName,
        remarks,
        lines,
        serverInfo,
        journeysFromTrip,
    }
}

export {
    CACHE, HEADERS, RESPONSE, SERVER_TIMING
}
