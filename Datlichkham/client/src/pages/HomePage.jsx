import HeroSection from '../components/sections/HeroSection';
import FeaturedDoctors from '../components/sections/FeaturedDoctors';
import Specialties from '../components/sections/Specialties';
import TopClinics from '../components/sections/TopClinics';
import BookingProcess from '../components/sections/BookingProcess';
import Testimonials from '../components/sections/Testimonials';

export default function HomePage() {
    return (
        <main>
            <HeroSection />
            <Specialties />
            <TopClinics />
            <FeaturedDoctors />
            <BookingProcess />
            <Testimonials />
        </main>
    );
}
