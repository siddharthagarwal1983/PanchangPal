import { z } from 'zod';
/**
 * API_GET_TODAY — hero endpoint contract (TDD Part 2 §5.2; OpenAPI operationId
 * API_GET_TODAY). Deterministic + cacheable (ADR-010). This is the reference
 * implementation showing how §5 contracts are expressed as zod; the remaining
 * API_* contracts follow the same pattern and are generated from docs/api/openapi.yaml
 * (F-8 backend-owned).
 */
export declare const getTodayRequest: z.ZodObject<{
    lat: z.ZodNumber;
    lng: z.ZodNumber;
    tz: z.ZodString;
    tradition: z.ZodEnum<["generic", "north_indian", "south_indian_tamil", "bengali"]>;
    local_date: z.ZodString;
}, "strip", z.ZodTypeAny, {
    lat: number;
    lng: number;
    tz: string;
    tradition: "generic" | "north_indian" | "south_indian_tamil" | "bengali";
    local_date: string;
}, {
    lat: number;
    lng: number;
    tz: string;
    tradition: "generic" | "north_indian" | "south_indian_tamil" | "bengali";
    local_date: string;
}>;
export type GetTodayRequest = z.infer<typeof getTodayRequest>;
export declare const panchangSchema: z.ZodObject<{
    tithi: z.ZodString;
    nakshatra: z.ZodString;
    yoga: z.ZodString;
    karana: z.ZodString;
    sunrise: z.ZodString;
    sunset: z.ZodString;
    muhurta: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        state: z.ZodString;
        label: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        state: string;
        label: string;
    }, {
        name: string;
        state: string;
        label: string;
    }>, "many">;
    rahu_kaal: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tithi: string;
    nakshatra: string;
    yoga: string;
    karana: string;
    sunrise: string;
    sunset: string;
    muhurta: {
        name: string;
        state: string;
        label: string;
    }[];
    rahu_kaal: string;
}, {
    tithi: string;
    nakshatra: string;
    yoga: string;
    karana: string;
    sunrise: string;
    sunset: string;
    muhurta: {
        name: string;
        state: string;
        label: string;
    }[];
    rahu_kaal: string;
}>;
export declare const ritualStepSchema: z.ZodObject<{
    text: z.ZodString;
    audio_key: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    text: string;
    audio_key?: string | undefined;
    duration?: number | undefined;
}, {
    text: string;
    audio_key?: string | undefined;
    duration?: number | undefined;
}>;
export declare const getTodayResponse: z.ZodObject<{
    panchang: z.ZodObject<{
        tithi: z.ZodString;
        nakshatra: z.ZodString;
        yoga: z.ZodString;
        karana: z.ZodString;
        sunrise: z.ZodString;
        sunset: z.ZodString;
        muhurta: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            state: z.ZodString;
            label: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            state: string;
            label: string;
        }, {
            name: string;
            state: string;
            label: string;
        }>, "many">;
        rahu_kaal: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        tithi: string;
        nakshatra: string;
        yoga: string;
        karana: string;
        sunrise: string;
        sunset: string;
        muhurta: {
            name: string;
            state: string;
            label: string;
        }[];
        rahu_kaal: string;
    }, {
        tithi: string;
        nakshatra: string;
        yoga: string;
        karana: string;
        sunrise: string;
        sunset: string;
        muhurta: {
            name: string;
            state: string;
            label: string;
        }[];
        rahu_kaal: string;
    }>;
    ritual: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        intro: z.ZodOptional<z.ZodString>;
        steps: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            audio_key: z.ZodOptional<z.ZodString>;
            duration: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            text: string;
            audio_key?: string | undefined;
            duration?: number | undefined;
        }, {
            text: string;
            audio_key?: string | undefined;
            duration?: number | undefined;
        }>, "many">;
        audio_key: z.ZodOptional<z.ZodString>;
        depth: z.ZodEnum<["quick", "deep"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        steps: {
            text: string;
            audio_key?: string | undefined;
            duration?: number | undefined;
        }[];
        depth: "quick" | "deep";
        audio_key?: string | undefined;
        intro?: string | undefined;
    }, {
        id: string;
        title: string;
        steps: {
            text: string;
            audio_key?: string | undefined;
            duration?: number | undefined;
        }[];
        depth: "quick" | "deep";
        audio_key?: string | undefined;
        intro?: string | undefined;
    }>;
    festival: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        significance: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        significance: string;
    }, {
        name: string;
        id: string;
        significance: string;
    }>>;
    rotating: z.ZodObject<{
        type: z.ZodEnum<["quote", "fact", "on_this_day"]>;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "quote" | "fact" | "on_this_day";
        text: string;
    }, {
        type: "quote" | "fact" | "on_this_day";
        text: string;
    }>;
    streak: z.ZodObject<{
        current_len: z.ZodNumber;
        grace_remaining: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        current_len: number;
        grace_remaining: number;
    }, {
        current_len: number;
        grace_remaining: number;
    }>;
    meta: z.ZodObject<{
        engine_version: z.ZodString;
        computed_at: z.ZodString;
        cache: z.ZodEnum<["hit", "miss"]>;
    }, "strip", z.ZodTypeAny, {
        engine_version: string;
        computed_at: string;
        cache: "hit" | "miss";
    }, {
        engine_version: string;
        computed_at: string;
        cache: "hit" | "miss";
    }>;
}, "strip", z.ZodTypeAny, {
    panchang: {
        tithi: string;
        nakshatra: string;
        yoga: string;
        karana: string;
        sunrise: string;
        sunset: string;
        muhurta: {
            name: string;
            state: string;
            label: string;
        }[];
        rahu_kaal: string;
    };
    ritual: {
        id: string;
        title: string;
        steps: {
            text: string;
            audio_key?: string | undefined;
            duration?: number | undefined;
        }[];
        depth: "quick" | "deep";
        audio_key?: string | undefined;
        intro?: string | undefined;
    };
    festival: {
        name: string;
        id: string;
        significance: string;
    } | null;
    rotating: {
        type: "quote" | "fact" | "on_this_day";
        text: string;
    };
    streak: {
        current_len: number;
        grace_remaining: number;
    };
    meta: {
        engine_version: string;
        computed_at: string;
        cache: "hit" | "miss";
    };
}, {
    panchang: {
        tithi: string;
        nakshatra: string;
        yoga: string;
        karana: string;
        sunrise: string;
        sunset: string;
        muhurta: {
            name: string;
            state: string;
            label: string;
        }[];
        rahu_kaal: string;
    };
    ritual: {
        id: string;
        title: string;
        steps: {
            text: string;
            audio_key?: string | undefined;
            duration?: number | undefined;
        }[];
        depth: "quick" | "deep";
        audio_key?: string | undefined;
        intro?: string | undefined;
    };
    festival: {
        name: string;
        id: string;
        significance: string;
    } | null;
    rotating: {
        type: "quote" | "fact" | "on_this_day";
        text: string;
    };
    streak: {
        current_len: number;
        grace_remaining: number;
    };
    meta: {
        engine_version: string;
        computed_at: string;
        cache: "hit" | "miss";
    };
}>;
export type GetTodayResponse = z.infer<typeof getTodayResponse>;
//# sourceMappingURL=today.d.ts.map