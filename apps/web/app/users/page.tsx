import { fetchParticipantsWithLocations } from "@/app/actions";
import { UserLayout } from "@/app/users/UserLayout";
import React from "react";

export default async function Page() {
	const participants = await fetchParticipantsWithLocations();
	return <UserLayout participants={participants} />;
}
