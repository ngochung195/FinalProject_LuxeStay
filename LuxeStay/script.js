let selectedRoom = null;
let highlightedRooms = [];

const clientBtn = document.getElementById('clientBtn');
const adminBtn = document.getElementById('adminBtn');

clientBtn.addEventListener('click', () => {
    clientBtn.classList.add('active');
    adminBtn.classList.remove('active');
    document.getElementById('clientView').style.display = 'block';
    document.getElementById('adminView').style.display = 'none';
});

adminBtn.addEventListener('click', () => {
    adminBtn.classList.add('active');
    clientBtn.classList.remove('active');
    document.getElementById('adminView').style.display = 'block';
    document.getElementById('clientView').style.display = 'none';
});

// Mặc định hiện Client
clientBtn.classList.add('active');
document.getElementById('adminView').style.display = 'none';

class Room {
    #isBooked = false;
    constructor(id, type, floor, basePrice) {
        this.id = id;
        this.type = type;
        this.floor = floor;
        this.basePrice = basePrice;
    }

    get isBooked() {
        return this.#isBooked;
    }

    book() {
        if (this.#isBooked) {
            console.error("Phòng đã được đặt!");
            return false;
        }
        this.#isBooked = true;
        return true;
    }

    cancel() {
        this.#isBooked = false;
    }

    set price(value) {
        if (value < 0) {
            throw new Error("Giá phòng không được nhỏ hơn 0!");
        }
        this.basePrice = value;
    }

    get price() {
        return this.basePrice;
    }
}

class Customer {
    constructor(id, name, phone, referredBy = null) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.referredBy = referredBy;
    }
}

class BookingSystem {
    constructor() {
        this.rooms = [];
        this.bookingHistory = [];
    }
}

const allCustomers = [
    new Customer("C001", "Hoàng Ánh", "0905555555", null),       // 0 điểm
    new Customer("C002", "Lê Trang", "0903333333", "C001"),   // 10 điểm (← A)
    new Customer("C003", "Trần Bắc", "0902222222", "C002"),   // 20 điểm (← B ← A)
    new Customer("C004", "Nguyễn Hoa", "0901111111", "C001"),   // 10 điểm (← A)
];

const bookingSystem = new BookingSystem();

const hotelMatrix = [
    [
        new Room(101, "Tiêu chuẩn", 1, 1500000),
        new Room(102, "Tiêu chuẩn", 1, 1500000),
        new Room(103, "Cao cấp", 1, 3000000),
        new Room(104, "Cao cấp", 1, 3000000),
        new Room(105, "Tổng thống", 1, 10000000)
    ],

    [
        new Room(201, "Tiêu chuẩn", 2, 1500000),
        new Room(202, "Tiêu chuẩn", 2, 1500000),
        new Room(203, "Cao cấp", 2, 3000000),
        new Room(204, "Cao cấp", 2, 3000000),
        new Room(205, "Tổng thống", 2, 10000000)
    ],

    [
        new Room(301, "Tiêu chuẩn", 3, 1500000),
        new Room(302, "Tiêu chuẩn", 3, 1500000),
        new Room(303, "Cao cấp", 3, 3000000),
        new Room(304, "Cao cấp", 3, 3000000),
        new Room(305, "Tổng thống", 3, 10000000)
    ],
    [
        new Room(401, "Tiêu chuẩn", 4, 1500000),
        new Room(402, "Tiêu chuẩn", 4, 1500000),
        new Room(403, "Cao cấp", 4, 3000000),
        new Room(404, "Cao cấp", 4, 3000000),
        new Room(405, "Tổng thống", 4, 10000000)
    ],
    [
        new Room(501, "Tiêu chuẩn", 5, 1500000),
        new Room(502, "Tiêu chuẩn", 5, 1500000),
        new Room(503, "Cao cấp", 5, 3000000),
        new Room(504, "Cao cấp", 5, 3000000),
        new Room(505, "Tổng thống", 5, 10000000)
    ]
];

function loadData() {
    const bookedIds = JSON.parse(localStorage.getItem("bookedRooms")) || [];
    hotelMatrix.forEach(floor => {
        floor.forEach(room => {
            if (bookedIds.includes(room.id)) {
                room.book();
            }
        });
    });

    bookingSystem.bookingHistory = JSON.parse(localStorage.getItem("bookingHistory")) || [];
}

loadData();

function renderHotelMap() {
    const container = document.getElementById("hotelMap");
    container.innerHTML = "";

    hotelMatrix.forEach(floor => {
        const floorDiv = document.createElement("div");
        floor.forEach(room => {
            const roomDiv = document.createElement("div");

            roomDiv.innerHTML = `
                <div>${room.id}</div>
                <div class="room-star">${getStars(room.basePrice)}</div>
            `;

            if (room.isBooked) {
                roomDiv.className = "bg-red";
            } else if (room === selectedRoom) {
                roomDiv.className = "bg-green selected-room";
            } else if (highlightedRooms.includes(room)) {
                roomDiv.className = "bg-highlight";
            } else {
                roomDiv.className = "bg-green";
            }

            if (room === selectedRoom) {
                roomDiv.classList.add(
                    "selected-room"
                );
            }
            roomDiv.addEventListener("click", function () {
                if (room.isBooked) {
                    message.textContent = "Phòng này đã được đặt!";
                    return;
                }
                selectedRoom = room;
                renderHotelMap();
                message.textContent = `Đã chọn phòng ${room.id} giá ${room.basePrice.toLocaleString('vi-VN')} VND`;
            });
            floorDiv.appendChild(roomDiv);
        });
        container.appendChild(floorDiv);
    });
}

function getStars(price) {
    if (price <= 1500000) return "⭐";
    if (price <= 3000000) return "⭐⭐";
    return "⭐⭐⭐";
}

bookingForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = customerName.value.trim();
    const phone = customerPhone.value.trim();

    if (!name || !phone) {
        message.textContent = "Vui lòng nhập đủ thông tin";
        return;
    }

    const phoneRegex = /^0\d{9}$/;

    if (!phoneRegex.test(phone)) {
        message.textContent =
            "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0";
        return;
    }

    if (!selectedRoom) {
        message.textContent = "Vui lòng chọn phòng";
        return;
    }

    const points = calculateReferralPoints(customerID, allCustomers);
    const discount = points >= 20 ? 0.05 : 0;
    const finalPrice = Math.round(selectedRoom.basePrice * (1 - discount));

    const invoice = {
        customerName: name,
        customerPhone: phone,
        room: {
            id: selectedRoom.id,
            type: selectedRoom.type,
            floor: selectedRoom.floor,
            basePrice: selectedRoom.basePrice
        },
        bookingDate: new Date().toLocaleString()
    };

    bookingSystem.bookingHistory.push(invoice);
    renderHistory();
    renderAdminStats();

    selectedRoom.book();
    saveData();
    highlightedRooms = [];

    const discountMsg = discount > 0 ? ` (đã giảm 5% còn ${finalPrice.toLocaleString('vi-VN')} VND)` : "";
    message.textContent = `Đặt phòng ${invoice.room.id} thành công${discountMsg}`;
    console.log(bookingSystem.bookingHistory);

    customerName.value = "";
    customerPhone.value = "";
    document.getElementById("customerID").value = "";
    document.getElementById("discountNotice").style.display = "none";
    selectedRoom = null;

    renderHotelMap();
    renderHistory();
    renderAdminStats();
    renderRevenueChart();
});

function renderHistory(data = bookingSystem.bookingHistory) {
    const tbody = document.getElementById("historyBody");
    tbody.innerHTML = "";

    data.forEach(item => {
        const price = item.finalPrice ?? item.room.basePrice;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.customerName}</td>
            <td>${item.customerPhone}</td>
            <td>${item.room.id}</td>
            <td>
                ${price.toLocaleString('vi-VN')} VND
                ${item.discount > 0 ? '<span style="color:#16a34a; font-size:12px;"> (−5%)</span>' : ""}
            </td>        
        `;
        tbody.appendChild(tr);
    });
}

function suggestAdjacentRooms(quantity) {
    const roomsPerFloor = hotelMatrix[0].length;

    if (quantity > roomsPerFloor) {
        message.textContent = `Mỗi tầng chỉ có ${roomsPerFloor} phòng, không thể tìm ${quantity} phòng liền kề.`;
        return null;
    }

    if (quantity < 1) {
        message.textContent = "Số phòng phải lớn hơn 0.";
        return null;
    }

    for (let f = 0; f < hotelMatrix.length; f++) {
        const floor = hotelMatrix[f];

        for (let i = 0; i <= floor.length - quantity; i++) {
            let allAvailable = true;

            for (let j = i; j < i + quantity; j++) {
                if (floor[j].isBooked) {
                    allAvailable = false;
                    break;
                }
            }

            if (allAvailable) {
                highlightedRooms = floor.slice(i, i + quantity);
                renderHotelMap();
                const ids = highlightedRooms.map(r => r.id).join(", ");
                message.textContent = `Gợi ý tầng ${f + 1}: phòng ${ids}`;
                return highlightedRooms;
            }
        }
    }

    highlightedRooms = [];
    renderHotelMap();
    message.textContent = `Không tìm được ${quantity} phòng liền kề còn trống.`;
    return null;
}

document.getElementById("adjacentBtn").addEventListener("click", function () {
    const qty = parseInt(document.getElementById("adjacentQty").value);

    if (isNaN(qty)) {
        message.textContent = "Vui lòng nhập số phòng cần tìm.";
        return;
    }

    highlightedRooms = [];
    suggestAdjacentRooms(qty);
});

function renderAdminStats() {
    const history = bookingSystem.bookingHistory;

    // 1. filter(): lọc hóa đơn có giá > 2 triệu
    const highValueBookings = history.filter(item => item.room.basePrice > 2000000);

    // 2. reduce(): tính tổng doanh thu
    const totalRevenue = history.reduce((sum, item) => sum + item.room.basePrice, 0);

    // 3. map(): trích xuất tên khách hàng
    const customerNames = history.map(item => item.customerName);

    document.getElementById("statRevenue").innerHTML = `
        <strong>Tổng doanh thu</strong>
        ${totalRevenue.toLocaleString('vi-VN')} VND
        <br><small>${history.length} đơn</small>
    `;

    document.getElementById("statHighValue").innerHTML = `
        <strong>Đơn cao cấp</strong>
        ${highValueBookings.length > 0
            ? highValueBookings.map(b => `${b.customerName} — Phòng ${b.room.id}`).join("<br>")
            : "Không có"}
    `;

    document.getElementById("statNameList").innerHTML = `
        <strong>Danh sách tri ân</strong>
        ${customerNames.length > 0 ? customerNames.join(", ") : "Chưa có khách hàng"}
    `;
}

document.getElementById("sortAsc").addEventListener("click", function () {
    const sorted = [...bookingSystem.bookingHistory].sort((a, b) => a.room.basePrice - b.room.basePrice);
    renderHistory(sorted);
    setActiveSort(this);
});

document.getElementById("sortDesc").addEventListener("click", function () {
    const sorted = [...bookingSystem.bookingHistory].sort((a, b) => b.room.basePrice - a.room.basePrice);
    renderHistory(sorted);
    setActiveSort(this);
});

document.getElementById("sortReset").addEventListener("click", function () {
    renderHistory();
    setActiveSort(this);
});

function setActiveSort(activeBtn) {
    document.querySelectorAll("#sortControls button").forEach(btn => {
        btn.classList.remove("active");
    });
    activeBtn.classList.add("active");
}

function calculateReferralPoints(customerID, customers) {
    const customer = customers.find(c => c.id === customerID);

    if (!customer) return 0;

    if (customer.referredBy === null) return 0;

    return 10 + calculateReferralPoints(customer.referredBy, customers);
}

function renderCustomerTable() {
    const tbody = document.getElementById("customerBody");
    tbody.innerHTML = "";

    allCustomers.forEach(c => {
        const points = calculateReferralPoints(c.id, allCustomers);
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>${c.phone}</td>
            <td>${c.referredBy || "—"}</td>
            <td>${points}</td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById("customerID").addEventListener("input", function () {
    const id = this.value.trim();
    const notice = document.getElementById("discountNotice");
    const points = calculateReferralPoints(id, allCustomers);
    notice.style.display = (id && points >= 20) ? "block" : "none";
});

function saveData() {
    const bookedIds = hotelMatrix.flat().filter(r => r.isBooked).map(r => r.id);
    localStorage.setItem("bookedRooms", JSON.stringify(bookedIds));
    localStorage.setItem("bookingHistory", JSON.stringify(bookingSystem.bookingHistory));
}

function renderRevenueChart() {
    const canvas = document.getElementById("revenueChart");
    if (!canvas) return;

    // Lấy width từ parentElement để tránh trường hợp adminView đang ẩn (offsetWidth = 0)
    const W = canvas.parentElement.offsetWidth || 600;
    const H = 260;
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d");

    // Lấy dữ liệu từ reduce() — tính doanh thu theo từng loại phòng
    const revenue = bookingSystem.bookingHistory.reduce((acc, item) => {
        const type = item.room.type;
        acc[type] = (acc[type] || 0) + item.room.basePrice;
        return acc;
    }, {});

    const categories = [
        { label: "Tiêu chuẩn", key: "Tiêu chuẩn", color: "#2563eb" },
        { label: "Cao cấp", key: "Cao cấp", color: "#7c3aed" },
        { label: "Tổng thống", key: "Tổng thống", color: "#dc2626" },
    ];

    const values = categories.map(c => revenue[c.key] || 0);
    const maxValue = Math.max(...values, 1); // tránh chia 0 khi chưa có đơn nào

    const paddingLeft = 60;
    const paddingBottom = 44;
    const paddingTop = 30;
    const paddingRight = 20;

    const chartW = W - paddingLeft - paddingRight;
    const chartH = H - paddingTop - paddingBottom;

    ctx.clearRect(0, 0, W, H);

    // Vẽ đường kẻ ngang & nhãn trục Y (4 mức)
    ctx.strokeStyle = "#e2e8f0";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px Arial";
    ctx.textAlign = "right";

    for (let i = 0; i <= 4; i++) {
        const y = paddingTop + chartH - (i / 4) * chartH;
        const value = (maxValue * i / 4) / 1000000;

        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(W - paddingRight, y);
        ctx.stroke();

        ctx.fillText(value.toFixed(1) + "tr", paddingLeft - 6, y + 4);
    }

    // Vẽ từng cột — barW thu hẹp còn 30% slot để trông thanh mảnh hơn
    const slotW = chartW / categories.length;
    const barW = slotW * 0.3;

    categories.forEach((cat, i) => {
        const barH = (values[i] / maxValue) * chartH;
        const x = paddingLeft + i * slotW + (slotW - barW) / 2;
        const y = paddingTop + chartH - barH;

        // Thân cột — bo góc trên
        const radius = 5;
        ctx.fillStyle = cat.color;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barW - radius, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
        ctx.lineTo(x + barW, y + barH);
        ctx.lineTo(x, y + barH);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();

        // Nhãn giá trị trên đầu cột
        ctx.fillStyle = cat.color;
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        if (values[i] > 0) {
            ctx.fillText(
                (values[i] / 1000000).toFixed(1) + "tr",
                x + barW / 2,
                y - 8
            );
        }

        // Nhãn tên loại phòng dưới cột
        ctx.fillStyle = "#64748b";
        ctx.font = "12px Arial";
        ctx.fillText(cat.label, x + barW / 2, H - paddingBottom + 20);
    });

    // Đường baseline trục X
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop + chartH);
    ctx.lineTo(W - paddingRight, paddingTop + chartH);
    ctx.stroke();
}

renderCustomerTable();
renderHotelMap();
renderHistory();
renderAdminStats();
renderRevenueChart();