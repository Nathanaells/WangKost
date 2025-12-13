import Sidebar from "@/components/Sidebar";
export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Sidebar />
    </>
  );
}
