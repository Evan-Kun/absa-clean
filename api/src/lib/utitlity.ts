export const isDateBefore = (intervalHours: number, inputDate: any) => {
    if (inputDate && intervalHours) {
        const currentTimeStamp = new Date().getTime();
        const timeStampData = new Date(inputDate).getTime()
        let diffInHour = (currentTimeStamp - timeStampData) / (1000 * 60 * 60);
        return Math.abs(Math.round(diffInHour)) > intervalHours;
    } else {
        return false;
    }
}

export enum HttpResponseStatus {
    NO_CONTENT = 204,
    NOT_AUTHENTICATED = 401,
    NOT_AUTHORIZED = 403,
    MISSING_PARAMS = 400,
    NOT_FOUND = 404,
    CONFLICT_DATA = 409,
    SERVER_ERROR = 500,
    SERVER_SUCCESS = 200,
}