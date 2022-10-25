type PickerParam = {
  accept: string;
  multiple: boolean;
};

export const FORMAT_ALL = "*";

export const FORMAT_IMAGE = "image/*";

export const FORMAT_IMAGE_SUPPORTED =
  "image/png,image/jpeg,image/gif,image/webp";

export const showFilePicker = (
  { accept, multiple }: PickerParam = { accept: FORMAT_ALL, multiple: false }
) => {
  const picker = document.createElement("input");
  picker.type = "file";
  picker.accept = accept;
  picker.multiple = multiple;
  return new Promise<File[]>((res, rej) => {
    picker.addEventListener("change", () => {
      if (picker.files === null) {
        rej();
        return;
      }
      console.log(picker.files);
      res(Array.from(picker.files));
    });
    picker.addEventListener("error", rej);
    picker.click();
  });
};
