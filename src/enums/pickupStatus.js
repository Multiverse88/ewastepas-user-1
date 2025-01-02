const PICKUP_STATUS = {
    WAITING: 'Menunggu Penjemputan',
    ON_DELIVERY: 'Dalam Perjalanan',
    PICKED_UP: 'Sampah Telah Dijemput',
    COMPLETED: 'Pesanan Selesai',
    FAILED: 'Penjemputan Gagal'
};

// Tambahkan fungsi helper
const isValidStatus = (status) => {
    return Object.values(PICKUP_STATUS).includes(status);
};

module.exports = {
    PICKUP_STATUS,
    isValidStatus
}; 