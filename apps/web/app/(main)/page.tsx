import { HomePageLayout } from "@/components/screens/home/HomePageLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Home | Hello Future",
};

export default function Home() {
	return <HomePageLayout />;
}
