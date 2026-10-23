import { useEffect, useRef, useState, type ReactNode } from "react";
import Botao from "../Botao/Botao";
import "./Modal.css";

interface ModalProps {
    aberto: boolean;
    titulo: string;
    children: ReactNode;
    textoConfirmar?: string;
    textoCancelar?: string;
    carregando?: boolean;
    aoConfirmar: () => void;
    aoFechar: () => void;
}

function Modal({
    aberto,
    titulo,
    children,
    textoConfirmar = "Confirmar",
    textoCancelar = "Cancelar",
    carregando = false,
    aoConfirmar,
    aoFechar,
}: ModalProps) {
    const [renderizado, setRenderizado] = useState(aberto);
    const [animando, setAnimando] = useState(false);
    const timeoutRef = useRef<number | undefined>(undefined);

    // Controla automaticamente a animação de entrada e saída quando "aberto" muda
    // Controla automaticamente a animação de entrada e saída quando "aberto" muda
    useEffect(() => {
        window.clearTimeout(timeoutRef.current);

        if (aberto) {
            const raf = requestAnimationFrame(() => {
                setRenderizado(true);
                requestAnimationFrame(() => {
                    setAnimando(true);
                });
            });
            return () => cancelAnimationFrame(raf);
        } else {
            const raf = requestAnimationFrame(() => {
                setAnimando(false);
            });
            timeoutRef.current = window.setTimeout(() => {
                setRenderizado(false);
            }, 300);

            return () => {
                cancelAnimationFrame(raf);
                window.clearTimeout(timeoutRef.current);
            };
        }
    }, [aberto]);

    // Fecha com a tecla Esc
    useEffect(() => {
        if (!renderizado) return;
        function aoPressionarTecla(e: KeyboardEvent) {
            if (e.key === "Escape" && !carregando) {
                aoFechar();
            }
        }
        window.addEventListener("keydown", aoPressionarTecla);
        return () => window.removeEventListener("keydown", aoPressionarTecla);
    }, [renderizado, carregando, aoFechar]);

    if (!renderizado) return null;

    return (
        <div
            className={`modal-overlay ${animando ? "aberto" : "fechado"}`}
            onClick={() => !carregando && aoFechar()}
        >
            <div
                className="modal-confirmacao"
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-icone">!</div>
                <h3>{titulo}</h3>
                <div>{children}</div>

                <div className="confirmar-botoes">
                    <Botao
                        className="btn-confirmar-sim"
                        texto={carregando ? "Processando..." : textoConfirmar}
                        type="button"
                        disabled={carregando}
                        onClick={aoConfirmar}
                    />
                    <button
                        type="button"
                        className="btn-manter-inscricao"
                        disabled={carregando}
                        onClick={aoFechar}
                    >
                        {textoCancelar}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;