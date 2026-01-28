import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";

interface NativeTerminalProps {
  onInput?: (command: string) => void;
  output?: string[];
  isActive?: boolean;
}

export default function NativeTerminal({
  onInput,
  output,
  isActive,
}: NativeTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: '"JetBrains Mono", monospace',
      theme: {
        background: "#0D1117",
        foreground: "#C9D1D9",
        cursor: "#00FF87",
        cursorAccent: "#0D1117",
      },
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(containerRef.current);
    fitAddon.fit();

    // Output initial message
    term.write("Code Server Terminal - Native WASM Emulation\r\n");
    term.write('Type "help" for available commands\r\n');
    term.write("\r\n");

    // Handle input
    let currentInput = "";
    term.onData((data) => {
      if (data === "\r") {
        // Enter pressed
        term.write("\r\n");
        if (onInput) {
          onInput(currentInput);
        }
        currentInput = "";
        term.write("$ ");
      } else if (data === "\u0003") {
        // Ctrl+C
        currentInput = "";
        term.write("^C\r\n$ ");
      } else if (data === "\u007F") {
        // Backspace
        if (currentInput.length > 0) {
          currentInput = currentInput.slice(0, -1);
          term.write("\b \b");
        }
      } else if (data >= " ") {
        // Printable character
        currentInput += data;
        term.write(data);
      }
    });

    terminalRef.current = term;

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
    };
  }, [onInput]);

  useEffect(() => {
    if (!terminalRef.current || !output) return;

    output.forEach((line) => {
      terminalRef.current?.write(line + "\r\n");
    });
  }, [output]);

  return (
    <View style={styles.container}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1117",
    borderRadius: 8,
  },
});
