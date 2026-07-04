import { Trash2 } from "lucide-react";

function Button(props: React.ComponentProps<"button"> & { size?: "icon" }) {
  return <button {...props} />;
}

export function App() {
  return (
    <main>
      <Input placeholder="Search employees" />
      <Button size="icon">
        <Trash2 />
      </Button>
      <div onClick={() => console.log("open")} className="outline-none">
        Open employee
      </div>
      <div aria-label="Loading page">
        <span className="size-4 rounded-full" title="Active" />
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
      </table>
    </main>
  );
}

function Input(props: React.ComponentProps<"input">) {
  return <input {...props} />;
}
