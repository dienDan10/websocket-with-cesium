export const createCampaignSlice = (set) => ({
    campaign: {
        id: null,
        name: null,
    },
    aoBoundary: null,
    setAoBoundary: (boundary) =>
        set((state) => {
            state.aoBoundary = boundary;
        }),
});
