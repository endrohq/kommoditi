
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "Home | Hello Future",
}

export default function Home() {

  // Parse the above CSS classes into a React component with tailwind
  return (
    <main className="flex flex-col justify-between items-center bg-white p-24 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-gray-800">Hello Future</h1>
    </main>
  )
}
