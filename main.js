const fs = require("fs");
const deliveryStartSec = 8*3600;
const deliveryEndSec = 22*3600;
const attributes = {
    driverID: 0,
    driverName: 1,
    date: 2,
    startTime: 3,
    endTime: 4,
    shiftDuration: 5,
    idleTime: 6,
    activeTime: 7,
    metQuota: 8,
    hasBonus: 9
};

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
    let total = timeToSeconds(shiftDuration) - timeToSeconds(idleTime);
    return secondsToTime(total);
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================

/*
Checks if the driver hit the daily minimum. Normal days need 8h 24m; during the Eid period (Apr 10–30, 2025), only 6h.
 */
function metQuota(date, activeTime) {
    let [year, month, day] = date.split("-");
    day = parseInt(day);
    let requiredInSeconds = (8*3600) + (24*60);
    if (parseInt(month) === 4 && day >= 10 && day <= 30) {
         requiredInSeconds = (6 * 3600)
    }

    const activeTimeSec = timeToSeconds(activeTime);
    return requiredInSeconds <= activeTimeSec;
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    //Step 1: compute derivatives
    shiftObj.shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
    shiftObj.idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
    shiftObj.activeTime = getActiveTime(shiftObj.shiftDuration, shiftObj.idleTime);
    shiftObj.metQuota = metQuota(shiftObj.date, shiftObj.activeTime);
    shiftObj.hasBonus = false;

    //Step 2: Check duplicates
    try {
        const data = fs.readFileSync(textFile, 'utf-8')
        const lines = data.trim().split("\n");
        const header = lines[0];
        lines.shift();    //removes the header line


        const dupesFound = lines.some(r => {
            const cols = r.split(",");
            return cols[0] === shiftObj.driverID && cols[2] === shiftObj.date;
        });

        if (dupesFound) return {};
        //Step 3: Add Shift & maintain order
        let stringToWrite = [
            shiftObj.driverID,
            shiftObj.driverName,
            shiftObj.date,
            shiftObj.startTime,
            shiftObj.endTime,
            shiftObj.shiftDuration,
            shiftObj.idleTime,
            shiftObj.activeTime,
            shiftObj.metQuota.toString(),
            shiftObj.hasBonus.toString()
        ].join(",");

        lines.push(stringToWrite);

            function driverIdNumFromLine(line) {
                const id = line.split(",")[0].trim();   // "D1001"
                return Number(id.slice(1));            // 1001
            }

        lines.sort((a, b) => driverIdNumFromLine(a) - driverIdNumFromLine(b));
        let writeBack = `${header}\n${lines.join("\n")}`
        fs.writeFileSync(textFile, writeBack);
        return shiftObj;
    } catch (error) {
        console.log(error);

        return {}
    }
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
    if (typeof newValue === "string") {
        if (
            newValue.lower().trim() !== 'false' ||
            newValue.lower().trim() !== 'true'
        ) return;
    }
    if (typeof newValue === 'number' && newValue !== 0 && newValue !== 1) return;
    if (typeof newValue !== 'boolean') return;

    try{
        const data = fs.readFileSync(textFile, 'utf-8').trim();
        const lines = data.split("\n");
        const header = lines[0];

        const rowNum = lines.findIndex(r => {
            const columns = r.split(",");
            return columns[0] === driverID && columns[2] === date;
        });

        if (rowNum === -1) return;

        const columnsAgain = lines[rowNum].split(",")

        const driver = {
            driverID: columnsAgain[0],
            driverName: columnsAgain[1],
            date: columnsAgain[2],
            startTime: columnsAgain[3],
            endTime: columnsAgain[4],
            shiftDuration: columnsAgain[5],
            idleTime: columnsAgain[6],
            activeTime: columnsAgain[7],
            metQuota: columnsAgain[8],
            hasBonus: newValue
        }
        lines[rowNum] = [
            driver.driverID,
            driver.driverName,
            driver.date,
            driver.startTime,
            driver.endTime,
            driver.shiftDuration,
            driver.idleTime,
            driver.activeTime,
            driver.metQuota,
            driver.hasBonus.toString()
        ].join(",");

        fs.writeFileSync(textFile, lines.join("\n"));

    } catch (e) {
        console.error(e);
    }


}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    if (typeof month !== 'string') return;
    month = parseInt(month);

    try {
        const data = fs.readFileSync(textFile, 'utf-8').trim();
        const lines = data.split("\n");
        lines.shift();

        let bonusAcc = lines.reduce((acc, line) => {
            const col = line.split(",");
            let monthToCompare = col[2].split("-")[1]
            if (parseInt(monthToCompare) === month && col[0] === driverID && col[9].trim() === 'true') {
                acc++;
            }
            return acc;
        }, 0)

        return bonusAcc <= 0 ? -1 : bonusAcc;
    } catch (e) {
        console.log('catch block')
        return -1
    }
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    if (typeof month !== 'number') return;

    try {
        const data = fs.readFileSync(textFile, 'utf-8').trim();
        const lines = data.split("\n");
        lines.shift();

        let activeHoursPerMonthNum = lines.reduce((acc, line) => {
            const cols = line.split(",");
            if (cols[attributes.driverID] === driverID &&
                parseInt(cols[attributes.date].split('-')[1]) === month)
            acc += timeToSeconds(cols[attributes.activeTime]);
            return acc;
        },0)

        return secondsToTime(activeHoursPerMonthNum);
    } catch (e) {
        return secondsToTime(0);
    }
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
