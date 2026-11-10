"use client";

import { Button, TextField } from "@events-lab/shared-components";
import { useState, type FormEvent } from "react";

export function AccountForm() {
  const [name, setName] = useState("Jordan Hale");
  const [phone, setPhone] = useState("555-0148");
  const [saved, setSaved] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <TextField
        label="Name"
        value={name}
        onChange={(event) => {
          setSaved(false);
          setName(event.target.value);
        }}
      />
      <TextField
        label="Phone"
        value={phone}
        hint="Used for day-of event updates."
        onChange={(event) => {
          setSaved(false);
          setPhone(event.target.value);
        }}
      />
      <div className="flex items-center gap-3">
        <Button type="submit">Save account</Button>
        {saved ? (
          <p className="text-sm text-teal-800" role="status">
            Saved {name}.
          </p>
        ) : null}
      </div>
    </form>
  );
}
