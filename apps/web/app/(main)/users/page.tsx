import { fetchParticipantsWithLocations } from "@/app/(main)/actions";
import { UserLayout } from "@/app/(main)/users/UserLayout";
import React from "react";

export default async function Page() {
	const participants = await fetchParticipantsWithLocations();
	return <UserLayout participants={participants} />;
}
