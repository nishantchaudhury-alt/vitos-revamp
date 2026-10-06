import { useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-lg border border-[#e8e6e1] bg-white px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground/70 focus:border-[#B22257]";

function FieldLabel({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-[12.5px] font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-[#B22257]">*</span>}
      </div>
      {children}
    </label>
  );
}

export type NewWebsite = { name: string; link: string; logoUrl: string; logoName: string };

export function WebsiteConfigPanel({
  logo,
  onClose,
  onSubmit,
}: {
  logo: React.ReactNode;
  onClose: () => void;
  onSubmit: (website: NewWebsite) => void;
}) {
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoName, setLogoName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const nameMissing = !name.trim();

  const submit = () => {
    setNameTouched(true);
    if (nameMissing) return;
    onSubmit({ name: name.trim(), link: link.trim(), logoUrl: logoUrl.trim(), logoName });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#faf9f7]">
      <div className="flex shrink-0 items-center gap-3 border-b border-[#e8e6e1] px-5 py-4">
        {logo}
        <div className="min-w-0 flex-1 text-[15px] font-semibold text-foreground">
          Website Configuration
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-muted-foreground hover:bg-white hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="text-[14px] font-semibold text-foreground">Configure</div>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Fill out your required website integration details below
          </p>

          <div className="mt-4 space-y-3.5">
            <FieldLabel label="Name" required>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => setNameTouched(true)}
                placeholder="Enter the website name"
                aria-invalid={nameTouched && nameMissing}
                className={cn(inputCls, nameTouched && nameMissing && "border-red-300")}
              />
              {nameTouched && nameMissing && (
                <span className="mt-1 block text-[11.5px] text-red-600">Name is required.</span>
              )}
            </FieldLabel>

            <FieldLabel label="Website Link">
              <input
                value={link}
                onChange={(event) => setLink(event.target.value)}
                placeholder="Enter the website link"
                className={inputCls}
              />
            </FieldLabel>

            <div>
              <div className="mb-1 text-[12.5px] font-medium text-foreground">Logo</div>
              <div className="relative">
                <input
                  value={logoName || logoUrl}
                  onChange={(event) => {
                    setLogoName("");
                    setLogoUrl(event.target.value);
                  }}
                  placeholder="Enter the logo URL"
                  aria-label="Logo URL"
                  className={cn(inputCls, "pr-10")}
                />
                <label
                  title="Upload logo"
                  className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-[#B22257] focus-within:ring-2 focus-within:ring-[#B22257]/35"
                >
                  <UploadCloud className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Upload logo</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setLogoName(file.name);
                      setLogoUrl(URL.createObjectURL(file));
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#e8e6e1] bg-white px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#B22257]/40 bg-white px-5 py-1.5 text-[13px] font-medium text-[#B22257] hover:bg-[#FDF3F7]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={nameMissing}
            className="rounded-lg bg-[#B22257] px-5 py-1.5 text-[13px] font-semibold text-white ring-1 ring-inset ring-[#B22257] hover:bg-[#9c1e4d] disabled:cursor-not-allowed disabled:bg-[#FDF3F7] disabled:text-[#B22257]/60 disabled:ring-[#B22257]/30"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
