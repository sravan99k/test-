/**
 * Centralized asset management to ensure consistent paths across the application.
 * This makes the application more maintainable and "future-proof" as requested.
 */

export const ASSETS = {
    // Brand Assets
    LOGO: '/logo.png',
    FAVICON: '/favicon.ico',
    BUDDY_BOT: '/BuddyBoticon.png',
    YOU_ICON: '/you.png',

    // Common Illustrations
    WELLNESS_HERO: '/wellness.webp',
    HOME_HERO: '/hom.webp',
    WAITING_ILLUSTRATION: '/waiting-illustration.svg',

    // Resource Folders
    RESOURCES_BASE: '/Resource Images',

    // Icons
    BUDDY_SAFE_ICON: '/images/buddysafeicon.png',

    // Helper to get resource image path
    resource: (category: string, filename: string) => `/Resource Images/${category}/${filename}`,

    // Safety Category
    safety: {
        ACADEMIC_PRESSURE: '/images/AcademicPressureMentalHealth.webp',
        PHYSICAL_VIOLENCE: '/images/PhysicalBullyingViolence.webp',
        SUBSTANCE_ABUSE: '/images/SubstanceAbusePeerPressure.webp',
        CYBERBULLYING: '/images/cyberbulling.webp',
    }
};

export default ASSETS;
