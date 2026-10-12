
console.log("========== QUY TRINH MUON TRA THU VIEN ==========");

// 1. Du lieu ban dau
const circulationLogs = [
    {
        logId: "L001",
        studentCode: "SV001",
        bookIsbn: "ISBN001",
        status: "BORROWING",
        fineAmount: 0,
        borrowDate: "2026-10-01",
        dueDate: "2026-10-05",
        returnDate: null,
        settled: false
    },
    {
        logId: "L002",
        studentCode: "SV002",
        bookIsbn: "ISBN002",
        status: "BORROWING",
        fineAmount: 0,
        borrowDate: "2026-09-20",
        dueDate: "2026-09-25",
        returnDate: null,
        settled: false
    },
    {
        logId: "L003",
        studentCode: "SV003",
        bookIsbn: "ISBN003",
        status: "RETURNED",
        fineAmount: 10000,
        borrowDate: "2026-09-01",
        dueDate: "2026-09-05",
        returnDate: "2026-09-07",
        settled: true,
        settledDate: "2026-09-07"
    }
];

// Danh sach ma sinh vien hop le
const students = ["SV001", "SV002", "SV003", "SV004"];

// 2. CREATE: Tao giao dich muon sach moi
function borrowBook(logId, studentCode, bookIsbn, borrowDate, dueDate) {
    // Kiem tra ma sinh vien
    if (!students.includes(studentCode)) {
        console.log("Tu choi muon sach: Ma sinh vien khong hop le!");
        return;
    }

    // Kiem tra ma giao dich trung
    if (circulationLogs.some(log => log.logId === logId)) {
        console.log("Tu choi muon sach: Ma giao dich da ton tai!");
        return;
    }

    // Khong cho muon cung dau sach neu giao dich cu van dang BORROWING
    const alreadyBorrowing = circulationLogs.some(
        log => log.studentCode === studentCode
            && log.bookIsbn === bookIsbn
            && log.status === "BORROWING"
    );

    if (alreadyBorrowing) {
        console.log("Sinh vien dang muon dau sach nay!");
        return;
    }

    circulationLogs.push({
        logId,
        studentCode,
        bookIsbn,
        status: "BORROWING",
        fineAmount: 0,
        borrowDate,
        dueDate,
        returnDate: null,
        settled: false
    });

    console.log(`Da tao giao dich muon sach: ${logId}`);
}

// Mo phong sinh vien SV004 muon sach
borrowBook(
    "L004",
    "SV004",
    "ISBN004",
    "2026-10-09",
    "2026-10-12"
);

// 3. UPDATE: Tra sach va tinh phi phat
function returnBook(logId, returnDate, isLost = false) {
    const log = circulationLogs.find(item => item.logId === logId);

    if (!log) {
        console.log("Khong tim thay giao dich!");
        return;
    }

    if (log.status !== "BORROWING") {
        console.log("Giao dich khong o trang thai dang muon!");
        return;
    }

    // Truong hop mat sach
    if (isLost) {
        log.status = "LOST";
        log.fineAmount = 200000;
        log.returnDate = returnDate;
    } else {
        // Tinh so ngay tre han
        const due = new Date(log.dueDate + "T00:00:00Z");
        const returned = new Date(returnDate + "T00:00:00Z");

        const lateDays = Math.max(
            0,
            Math.floor((returned - due) / (1000 * 60 * 60 * 24))
        );

        log.status = "RETURNED";
        log.returnDate = returnDate;
        log.fineAmount = lateDays * 5000;
    }

    console.log(
        `Giao dich ${logId}: ${log.status} - Phi phat ${log.fineAmount.toLocaleString("vi-VN")} VND`
    );
}

// SV001 tra sach tre 2 ngay: phat 10.000 VND
returnBook("L001", "2026-10-07");

// SV002 bao mat sach: phat den bu 200.000 VND
returnBook("L002", "2026-10-09", true);

// 4. QUYET TOAN: Ghi nhan cac khoan phat da thu
function settleFine(logId, settledDate) {
    const log = circulationLogs.find(item => item.logId === logId);

    if (!log) {
        console.log("Khong tim thay giao dich!");
        return;
    }

    if (log.status === "BORROWING") {
        console.log("Khong the quyet toan khi sach van dang duoc muon!");
        return;
    }

    if (log.settled) {
        console.log("Khoan phat da duoc quyet toan truoc do!");
        return;
    }

    log.settled = true;
    log.settledDate = settledDate;

    console.log(`Da quyet toan giao dich ${logId}`);
}

// Thu phi cua 2 giao dich vua xu ly
settleFine("L001", "2026-10-09");
settleFine("L002", "2026-10-09");

// 5. DELETE: Xoa nhat ky da quyet toan qua 30 ngay
function cleanupLogs(currentDate) {
    const now = new Date(currentDate + "T00:00:00Z");
    const before = circulationLogs.length;

    for (let i = circulationLogs.length - 1; i >= 0; i--) {
        const log = circulationLogs[i];

        // Chi xoa giao dich da tra va da quyet toan
        if (
            (log.status === "RETURNED" || log.status === "LOST")
            && log.settled === true
            && log.settledDate
        ) {
            const settledDate = new Date(log.settledDate + "T00:00:00Z");
            const daysOld = Math.floor(
                (now - settledDate) / (1000 * 60 * 60 * 24)
            );

            if (daysOld > 30) {
                circulationLogs.splice(i, 1);
            }
        }
    }

    console.log(`Da don dep ${before - circulationLogs.length} nhat ky cu.`);
}

// Chay don dep theo ngay hien tai
cleanupLogs("2026-10-09");

// 6. READ: Lap bao cao cuoi ngay
const borrowingCount = circulationLogs.filter(
    log => log.status === "BORROWING"
).length;

const returnedCount = circulationLogs.filter(
    log => log.status === "RETURNED"
).length;

const lostCount = circulationLogs.filter(
    log => log.status === "LOST"
).length;

// Tong tien phat da thu, khong tinh cac khoan chua quyet toan
const totalFineCollected = circulationLogs
    .filter(log => log.settled === true)
    .reduce((sum, log) => sum + log.fineAmount, 0);

// Tong tien phat con chua thu
const totalFinePending = circulationLogs
    .filter(log => log.settled === false && log.status !== "BORROWING")
    .reduce((sum, log) => sum + log.fineAmount, 0);

// 7. IN BAO CAO
console.log("");
console.log("==================================================");
console.log("          BAO CAO LUU CHUYEN CUOI NGAY");
console.log("==================================================");

console.table(circulationLogs);

console.log("Tong so giao dich:", circulationLogs.length);
console.log("Sach dang duoc muon:", borrowingCount);
console.log("Sach da tra:", returnedCount);
console.log("Sach bi mat:", lostCount);
console.log(
    "Tong tien phat da thu:",
    totalFineCollected.toLocaleString("vi-VN"),
    "VND"
);
console.log(
    "Tong tien phat chua thu:",
    totalFinePending.toLocaleString("vi-VN"),
    "VND"
);

console.log("==================================================");