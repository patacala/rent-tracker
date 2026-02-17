export declare const APP_CONFIG: {
    readonly name: "Relocation Intelligence";
    readonly version: "0.0.1";
    readonly defaultCity: "miami";
};
export declare const API_CONFIG: {
    readonly baseUrl: string;
    readonly version: "v1";
    readonly timeout: 10000;
};
export declare const MIAMI_CONFIG: {
    readonly center: {
        readonly lat: 25.7617;
        readonly lng: -80.1918;
    };
    readonly defaultRegion: {
        readonly lat: 25.7617;
        readonly lng: -80.1918;
        readonly latitudeDelta: 0.15;
        readonly longitudeDelta: 0.15;
    };
    readonly neighborhoods: readonly [{
        readonly id: "brickell";
        readonly name: "Brickell";
        readonly lat: 25.7593;
        readonly lng: -80.1937;
    }, {
        readonly id: "wynwood";
        readonly name: "Wynwood";
        readonly lat: 25.8008;
        readonly lng: -80.1995;
    }, {
        readonly id: "coral-gables";
        readonly name: "Coral Gables";
        readonly lat: 25.7215;
        readonly lng: -80.2684;
    }, {
        readonly id: "coconut-grove";
        readonly name: "Coconut Grove";
        readonly lat: 25.7308;
        readonly lng: -80.2394;
    }, {
        readonly id: "little-havana";
        readonly name: "Little Havana";
        readonly lat: 25.7697;
        readonly lng: -80.2299;
    }, {
        readonly id: "design-district";
        readonly name: "Design District";
        readonly lat: 25.8124;
        readonly lng: -80.1942;
    }, {
        readonly id: "downtown";
        readonly name: "Downtown Miami";
        readonly lat: 25.7749;
        readonly lng: -80.1936;
    }, {
        readonly id: "south-beach";
        readonly name: "South Beach";
        readonly lat: 25.7825;
        readonly lng: -80.13;
    }];
};
export declare const SCORE_WEIGHTS: {
    readonly commute: 0.4;
    readonly amenities: 0.4;
    readonly family: 0.2;
};
export declare const COMMUTE_OPTIONS: readonly [15, 30, 45];
//# sourceMappingURL=index.d.ts.map