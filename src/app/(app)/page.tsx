// REVIEWED - 05

import { redirect } from "next/navigation";

const HomePage = function HomePage() {
  redirect("/dashboard");
};

export default HomePage;
