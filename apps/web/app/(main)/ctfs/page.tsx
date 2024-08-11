"use client";

import { RegisterParticipantProfile } from "@/app/(main)/ctfs/RegisterParticipantProfile";
import { ParticipantType } from "@/typings";
import React from "react";

export default function Page() {
	return <RegisterParticipantProfile type={ParticipantType.CTF} />;
}
