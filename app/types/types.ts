export interface ChatMessage {
    sender: string;
    text: string;
    time: string;
}

export interface SignalData {
    room: string;
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
}

export interface MatchData {
    room: string;
    partnerName: string;
    initiator: boolean;
}

export interface ChatData {
    room: string;
    sender: string;
    text: string;
    time: string;
}