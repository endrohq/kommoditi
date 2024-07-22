import { HomePageLayout } from "@/app/components/HomePageLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Home | Hello Future",
};

export default function Home() {
	return <HomePageLayout />;
}
