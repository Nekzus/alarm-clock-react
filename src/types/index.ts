export interface TimeInput {
    hour: number;
    minute: number;
    second: number;
}

export interface AlarmConfig {
    targetTime: TimeInput;
    anticipationValue: number;
    anticipationUnit: 'seconds' | 'minutes' | 'hours';
    posteriorValue?: number;
    posteriorUnit?: 'seconds' | 'minutes' | 'hours';
    isRepetitive?: boolean;
    repetitiveMinutes?: number[];
}

export interface AlarmState {
    isActive: boolean;
    alarmTime: Date | null;
    targetTime: Date | null;
    countdown: {
        hours: number;
        minutes: number;
        seconds: number;
    } | null;
}

export interface ClockState {
    currentTime: string;
    currentDate: Date;
    isOnline: boolean;
    lastSync: Date | null;
}

export type AnticipationUnit = 'seconds' | 'minutes' | 'hours';

export interface ValidationError {
    field: string;
    message: string;
}
