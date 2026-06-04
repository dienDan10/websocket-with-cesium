export const createConnectionSlice = (set) => ({
    connection: {
        status: 'disconnected',
        error: null,
    },
    setConnectionStatus: (status) =>
        set((state) => {
            state.connection.status = status;
        }),
});
