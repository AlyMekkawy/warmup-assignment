const fs = require("fs");
const placeholderDate =("2026-01-01")
const deliveryStartTime = new Date(`${placeholderDate}T08:00:00`);
const deliveryEndTime = new Date(`${deliveryStartTime}T22:00:00`);
const deliveryStartSec = 8*3600;
const deliveryEndSec = 22*3600;

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    return getTimeDiff(startTime, endTime);
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    // TODO: Implement this function

    // Idle time is defined as any activity before 8am and after 10pm
    // we can easily check this by converting everything to seconds
    // then if the startTime < deliveryStartTime (5am < 8am) then that means there's idle activity time before
    // same thing for endTime bugt reverse

    // in the case that idle activity is found, we should do deliveryStartTime - startTime for the idle time only

    let startSeconds = timeToSeconds(convertToMilitaryTime(startTime));
    let endSeconds = timeToSeconds(convertToMilitaryTime(endTime));

    let idleTime = 0;
    if  (startSeconds < deliveryStartSec){
        idleTime += deliveryStartSec - startSeconds;
    }
    if (deliveryEndSec < endSeconds) {
        idleTime += endSeconds - deliveryEndSec;
    }

    return secondsToTime(idleTime);
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    // TODO: Implement this function
    let total = timeToSeconds(shiftDuration) - timeToSeconds(idleTime);
    return secondsToTime(total);
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    // TODO: Implement this function
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    // TODO: Implement this function
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    // TODO: Implement this function
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    // TODO: Implement this function
}

// ========Helpers===============
function convertToMilitaryTime(time){
    let [timePart, xmPart] = time.split(" ");
    let [h,m,s] = timePart.split(":");

    h = parseInt(h);

    //Case 1: >12 times
    if (xmPart === 'pm' && h !== 12) h +=12;
    //Case 2: 00 time
    if (xmPart === 'am' && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:${m}:${s}`;
}
const getTimeDiff = (t1, t2) => {
    let start = timeToSeconds((t1));
    let end =  timeToSeconds((t2));

    let total = (end >= start) ? (end - start) : ((end + (24 * 3600)) - start); // this should work for midnight corssing

    return secondsToTime(total)
}
const timeToSeconds = (time) => {
    if (time.charAt(time.length-1).trimEnd().toLowerCase().replace(/\./g, "") === 'm') //this is a terrible way to check but here we are
        time = convertToMilitaryTime(time);
    return time
        .split(":")
        .map(Number)
        .reduce((acc, num, i) => acc + num * [3600, 60, 1][i], 0);
}
const secondsToTime = (totalSec) =>{
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const str = (n) => String(n);
    return `${str(h)}:${str(m).padStart(2, "0")}:${str(s).padStart(2, "0")}`;
}



module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
