export interface Register {
  kind: string;
  description: string;
}

const generalPurpose = (number: number): string => {
  if (number === 0) {
    return "Volatile scratch register. In a prologue it is the saved link register on its way to the stack, and in some addressing forms it reads as zero rather than as a register.";
  }
  if (number === 1) {
    return "The stack pointer. It points at the lowest address of the current stack frame, and the word it points at is the back chain to the caller's frame.";
  }
  if (number === 2) {
    return "The table of contents pointer. It points at the module's table of contents, out of which globals and function descriptors are addressed.";
  }
  if (number === 3) {
    return "The first argument of a call and the value the call returns.";
  }
  if (number <= 10) {
    return `Argument ${number - 2} of a call. Volatile, so a called function may change it without saving it.`;
  }
  if (number <= 12) {
    return "Volatile scratch register. A call through a function descriptor uses it, so it holds nothing across a call.";
  }
  if (number === 13) {
    return "The thread pointer. It is reserved and points at the thread local storage of the running thread.";
  }
  return `Non volatile register. A function that writes it saves it into its frame first and restores it before it returns.`;
};

const floatingPoint = (number: number): string => {
  if (number === 0) {
    return "Volatile floating-point scratch register.";
  }
  if (number === 1) {
    return "The first floating-point argument of a call and the floating-point value the call returns.";
  }
  if (number <= 13) {
    return `Floating-point argument ${number} of a call. Volatile, so a called function may change it without saving it.`;
  }
  return "Non volatile floating-point register. A function that writes it saves it into its frame first and restores it before it returns.";
};

const vector = (number: number): string => {
  if (number <= 1) {
    return "Volatile vector scratch register of the vector unit.";
  }
  if (number === 2) {
    return "The first vector argument of a call and the vector the call returns.";
  }
  if (number <= 13) {
    return `Vector argument ${number - 1} of a call. Volatile, so a called function may change it without saving it.`;
  }
  if (number <= 19) {
    return "Volatile vector register.";
  }
  return "Non volatile vector register. A function that writes it saves it into its frame first and restores it before it returns.";
};

const condition = (number: number): string => {
  if (number === 0) {
    return "Condition register field that the record form of an integer instruction writes, holding whether the result was negative, zero or positive, and the summary overflow.";
  }
  if (number === 1) {
    return "Condition register field that the record form of a floating-point instruction writes, holding the exception summary of the floating-point status and control register.";
  }
  if (number <= 4) {
    return `Non volatile condition register field. A function that writes it restores it before it returns.`;
  }
  return "Volatile condition register field. A compare instruction names the field it writes, and a branch names the field it reads.";
};

const named: { [name: string]: string } = {
  LR: "The link register. A call places the address of the instruction after it here, and a return branches to it.",
  CTR: "The count register. It counts the turns of a loop for the decrementing branches, and it holds the target of a branch through a pointer.",
  XER: "The fixed-point exception register. It carries the carry bit, the overflow bits and the byte count of the string instructions.",
  MSR: "The machine state register. It holds the state of the processor itself, among it the interrupt and the address translation state.",
  FPSCR: "The floating-point status and control register. It holds the rounding mode and which floating-point exceptions occurred.",
  VRSAVE: "The vector save register. Each of its bits says whether the matching vector register is in use, so the operating system saves only those.",
  TBL: "The lower half of the time base, a counter that runs with the timebase frequency of the processor.",
  TBU: "The upper half of the time base, a counter that runs with the timebase frequency of the processor.",
  SPR: "A special purpose register named by its number, which the move instructions read and write."
};

export const getRegister = (value: string): Register => {
  const special = named[value.toUpperCase()];
  if (special) {
    return { kind: "Special register", description: special };
  }
  const numbered = value.toLowerCase().match(/^(r|f|fr|v|vr|vs|cr)([0-9]|[12][0-9]|3[01])$/);
  if (!numbered) {
    return null;
  }
  const number = parseInt(numbered[2], 10);
  if (numbered[1] === "cr") {
    if (number > 7) {
      return null;
    }
    return { kind: "Condition register field", description: condition(number) };
  }
  if (numbered[1] === "r") {
    return { kind: "General-purpose register", description: generalPurpose(number) };
  }
  if (numbered[1] === "f" || numbered[1] === "fr") {
    return { kind: "Floating-point register", description: floatingPoint(number) };
  }
  return { kind: "Vector register", description: vector(number) };
};

export const setRegisterHover = (value: string, formattedText: any) => {
  const register = getRegister(value);
  if (register === null) {
    return;
  }
  formattedText.appendMarkdown(`**ASM Register**  \n`);
  formattedText.appendMarkdown(`* **Kind:** ${register.kind}  \n`);
  formattedText.appendMarkdown(`* **Description:** ${register.description}  \n`);
};
