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

loadData();

function getRoomClass(room) {
    if (room.isBooked) {
        return "bg-red";
    }
    if (room === selectedRoom) {
        return "bg-green selected-room";
    }
    if (highlightedRooms.includes(room)) {
        return "bg-highlight";
    }
    return "bg-green";
}

function handleRoomSelection(room) {
    if (room.isBooked) {
        message.textContent = "Phòng này đã được đặt!";
        return;
    }
    selectedRoom = room;
    renderHotelMap();
    message.textContent = `Đã chọn phòng ${room.id} giá ${room.basePrice.toLocaleString('vi-VN')} VND`;
}

function createRoomElement(room) {
    const roomDiv = document.createElement("div");

    roomDiv.innerHTML = `
        <div>${room.id}</div>
        <div class="room-star">
            ${getStars(room.basePrice)}
        </div>
    `;

    roomDiv.className = getRoomClass(room);

    roomDiv.addEventListener("click", () => {
        handleRoomSelection(room);
    });

    return roomDiv;
}

function renderHotelMap() {
    const container = document.getElementById("hotelMap");
    container.innerHTML = "";

    hotelMatrix.forEach(floor => {
        const floorDiv = document.createElement("div");

        floor.forEach(room => {
            floorDiv.appendChild(
                createRoomElement(room)
            );
        });

        container.appendChild(floorDiv);
    });
}

function validateBookingForm(name, phone) {
    if (!name || !phone) {
        return "Vui lòng nhập đủ thông tin";
    }
    const phoneRegex = /^0\d{9}$/;

    if (!phoneRegex.test(phone)) {
        return "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0";
    }
    if (!selectedRoom) {
        return "Vui lòng chọn phòng";
    }
    return null;
}

function createInvoice(name, phone, room, discount) {
    return {
        customerName: name,
        customerPhone: phone,
        room: {
            id: room.id,
            type: room.type,
            floor: room.floor,
            basePrice: room.basePrice
        },
        discount,
        finalPrice: Math.round(
            room.basePrice * (1 - discount)
        ),
        bookingDate: new Date().toLocaleString()
    };
}

function resetBookingForm() {
    customerName.value = "";
    customerPhone.value = "";

    document.getElementById("customerID").value = "";
    document.getElementById("discountNotice").style.display = "none";
}

function completeBooking(invoice) {
    bookingSystem.bookingHistory.push(invoice);
    selectedRoom.book();
    highlightedRooms = [];
    saveData();
    selectedRoom = null;
}

function refreshUI() {
    renderHotelMap();
    renderHistory();
    renderAdminStats();
    renderRevenueChart();
}

bookingForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = customerName.value.trim();
    const phone = customerPhone.value.trim();
    const error = validateBookingForm(name, phone);

    if (error) {
        message.textContent = error;
        return;
    }

    const customerId = document.getElementById("customerID").value.trim();
    const points = calculateReferralPoints(customerId, allCustomers);
    const discount = points >= 20 ? 0.05 : 0;
    const invoice = createInvoice(name, phone, selectedRoom, discount);

    completeBooking(invoice);

    const discountMsg = discount > 0 ? ` (đã giảm 5% còn ${invoice.finalPrice.toLocaleString("vi-VN")} VND)` : "";
    message.textContent = `Đặt phòng ${invoice.room.id} thành công${discountMsg}`;

    resetBookingForm();
    refreshUI();
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

function getAdminStats(history) {
    return {
        totalRevenue: history.reduce(
            (sum, item) => sum + item.room.basePrice,
            0
        ),
        highValueBookings: history.filter(
            item => item.room.basePrice > 2000000
        ),
        customerNames: history.map(
            item => item.customerName
        )
    };
}

function renderRevenueStat(totalRevenue, totalOrders) {
    document.getElementById("statRevenue").innerHTML = `
        <strong>Tổng doanh thu</strong>
        ${totalRevenue.toLocaleString("vi-VN")} VND
        <br><small>${totalOrders} đơn</small>
    `;
}

function renderHighValueStat(bookings) {
    document.getElementById("statHighValue").innerHTML = `
        <strong>Đơn cao cấp</strong>
        ${bookings.length > 0
            ? bookings
                .map(b => `${b.customerName} — Phòng ${b.room.id}`)
                .join("<br>")
            : "Không có"}
    `;
}

function renderCustomerList(names) {
    document.getElementById("statNameList").innerHTML = `
        <strong>Danh sách tri ân</strong>
        ${names.length > 0
            ? names.join(", ")
            : "Chưa có khách hàng"}
    `;
}

function renderAdminStats() {
    const stats = getAdminStats(
        bookingSystem.bookingHistory
    );

    renderRevenueStat(
        stats.totalRevenue,
        bookingSystem.bookingHistory.length
    );

    renderHighValueStat(
        stats.highValueBookings
    );

    renderCustomerList(
        stats.customerNames
    );
}

function setActiveSort(activeBtn) {
    document.querySelectorAll("#sortControls button").forEach(btn => {
        btn.classList.remove("active");
    });
    activeBtn.classList.add("active");
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

// Khởi tạo canvas
function initializeChart(canvas) {
    const W = canvas.parentElement.offsetWidth || 600;

    const H = 260;

    canvas.width = W;
    canvas.height = H;

    return {
        ctx: canvas.getContext("2d"), W, H
    };
}

//Vẽ trục Y
function drawYAxis(ctx, W, paddingLeft, paddingRight, paddingTop, chartH, maxValue) {
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
}

// Vẽ cột
function drawBars(ctx, categories, values, maxValue, chartW, chartH, paddingLeft, paddingTop, H, paddingBottom) {
    const slotW = chartW / categories.length;

    const barW = slotW * 0.3;

    categories.forEach((cat, i) => {
        const barH = (values[i] / maxValue) * chartH;
        const x = paddingLeft + i * slotW + (slotW - barW) / 2;
        const y = paddingTop + chartH - barH;
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

        if (values[i] > 0) {
            ctx.fillStyle = cat.color;
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.fillText((values[i] / 1000000).toFixed(1) + "tr", x + barW / 2, y - 8);
        }

        ctx.fillStyle = "#64748b";
        ctx.font = "12px Arial";
        ctx.fillText(cat.label, x + barW / 2, H - paddingBottom + 20);
    });
}

// Vẽ trục X
function drawXAxis(ctx, paddingLeft, paddingTop, chartH, W, paddingRight) {
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop + chartH);
    ctx.lineTo(W - paddingRight, paddingTop + chartH);
    ctx.stroke();
}

function renderRevenueChart() {
    const canvas = document.getElementById("revenueChart");
    if (!canvas) return;
    const { ctx, W, H } = initializeChart(canvas);
    const revenue = getRevenueByRoomType(bookingSystem.bookingHistory);
    const categories = [
        {
            label: "Tiêu chuẩn",
            key: "Tiêu chuẩn",
            color: "#2563eb"
        },
        {
            label: "Cao cấp",
            key: "Cao cấp",
            color: "#7c3aed"
        },
        {
            label: "Tổng thống",
            key: "Tổng thống",
            color: "#dc2626"
        }
    ];

    const values = categories.map(c => revenue[c.key] || 0);
    const maxValue = Math.max(...values, 1);
    const paddingLeft = 60;
    const paddingBottom = 44;
    const paddingTop = 30;
    const paddingRight = 20;
    const chartW = W - paddingLeft - paddingRight;
    const chartH = H - paddingTop - paddingBottom;

    ctx.clearRect(0, 0, W, H);

    drawYAxis(ctx, W, paddingLeft, paddingRight, paddingTop, chartH, maxValue);
    drawBars(ctx, categories, values, maxValue, chartW, chartH, paddingLeft, paddingTop, H, paddingBottom);
    drawXAxis(ctx, paddingLeft, paddingTop, chartH, W, paddingRight);
}

renderCustomerTable();
renderHotelMap();
renderHistory();
renderAdminStats();
renderRevenueChart();