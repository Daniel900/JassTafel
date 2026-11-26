import type { ReactNode } from 'react';
import { DOUBLE_WIN_THRESHOLD, TARGET_SCORE } from '../domain/game';
import { MATCH_POINTS, ROUND_TOTAL } from '../domain/scoring';
import { Dialog } from './Dialog';

interface Props {
  onClose: () => void;
}

function Section({ title, open, children }: { title: string; open?: boolean; children: ReactNode }) {
  return (
    <details className="rules__section" open={open}>
      <summary>{title}</summary>
      <div className="rules__body">{children}</div>
    </details>
  );
}

/** Complete rules (house rules for the Schieber) and how to use the Jass Tafel – in German. */
export function RulesDialog({ onClose }: Props) {
  return (
    <Dialog title="Regeln & Anleitung" onClose={onClose}>
      <div className="rules">
        <Section title="1. Überblick" open>
          <p>
            Gespielt wird der <strong>Schieber</strong>: 4 Spieler in 2 Teams zu je 2 Personen. Die Partner sitzen
            sich gegenüber. Jedes Team zählt seine Punkte auf seiner Hälfte der Tafel.
          </p>
          <p>
            Ziel: Das Team, das zuerst <strong>{TARGET_SCORE} Punkte</strong> erreicht, gewinnt das Spiel. Über einen
            ganzen Jass-Abend werden die gewonnenen Spiele als <strong>Siege</strong> gezählt.
          </p>
        </Section>

        <Section title="2. Karten">
          <p>
            Wir spielen mit dem <strong>Skat-Blatt</strong>: 32 Karten, von der 7 bis zum Ass, ohne Joker. Die Farben
            sind Kreuz ♣, Pik ♠, Herz ♥ und Karo ♦. Jeder Spieler erhält 8 Karten.
          </p>
          <p>Rangfolge der Karten (hoch → tief):</p>
          <ul>
            <li>
              <strong>Trumpf:</strong> Bauer, 9 (Nell), Ass, König, Dame, 10, 8, 7
            </li>
            <li>
              <strong>Andere Farben:</strong> Ass, König, Dame, Bauer, 10, 9, 8, 7
            </li>
          </ul>
          <p>Für Folgen beim Melden gilt die natürliche Reihenfolge: 7, 8, 9, 10, Bauer, Dame, König, Ass.</p>
        </Section>

        <Section title="3. Trumpf">
          <p>
            In jeder Runde bestimmt ein Team den Trumpf. Das wechselt nach jeder Runde zum anderen Team – auch über
            das Ende eines Spiels hinaus ins nächste Spiel. Wer am Zug ist, darf den Trumpf selbst wählen oder zum
            Partner <strong>schieben</strong>, der dann wählen muss.
          </p>
          <p>
            Auf der Tafel zeigt das gelbe Feld <strong>«Trumpf»</strong>, welches Team diese Runde den Trumpf hat.
            Stimmt es nicht, tippt man beim richtigen Team auf «Trumpf?».
          </p>
        </Section>

        <Section title="4. Spielablauf">
          <p>
            Es wird reihum je eine Karte ausgespielt; die höchste Karte gewinnt den Stich (ein Trumpf schlägt jede
            Karte einer anderen Farbe). Wer den Stich gewinnt, spielt die nächste Karte aus. Nach 8 Stichen ist die
            Runde vorbei.
          </p>
          <p className="rules__note">
            Üblich beim Schieber: Farbe angeben, wer nicht angeben kann, darf trumpfen oder eine beliebige Karte
            abwerfen; trumpfen ist jederzeit erlaubt. Solche Details zum Ausspielen legt ihr am Tisch fest – die
            Tafel zählt nur die Punkte.
          </p>
        </Section>

        <Section title="5. Kartenpunkte">
          <table className="rules__table">
            <thead>
              <tr>
                <th>Karte</th>
                <th>Normal</th>
                <th>Trumpf</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>7, 8</td>
                <td>0</td>
                <td>0</td>
              </tr>
              <tr>
                <td>9 (Nell)</td>
                <td>0</td>
                <td>14</td>
              </tr>
              <tr>
                <td>10</td>
                <td>10</td>
                <td>10</td>
              </tr>
              <tr>
                <td>Bauer</td>
                <td>2</td>
                <td>20</td>
              </tr>
              <tr>
                <td>Dame</td>
                <td>3</td>
                <td>3</td>
              </tr>
              <tr>
                <td>König</td>
                <td>4</td>
                <td>4</td>
              </tr>
              <tr>
                <td>Ass</td>
                <td>11</td>
                <td>11</td>
              </tr>
            </tbody>
          </table>
          <p>
            Zusammen sind das 152 Punkte, dazu kommen <strong>5 Punkte für den letzten Stich</strong> – eine Runde
            ist also <strong>{ROUND_TOTAL} Punkte</strong> wert.
          </p>
          <p>
            <strong>Match:</strong> Macht ein Team <em>alle</em> Stiche, erhält es <strong>{MATCH_POINTS}</strong>{' '}
            Punkte, das andere Team 0. Hat ein Team zwar {ROUND_TOTAL} Punkte, das andere aber einen Stich ohne Punkte
            gemacht (z. B. nur 7er und 8er), ist es <em>kein</em> Match: dann zählt es {ROUND_TOTAL} : 0.
          </p>
        </Section>

        <Section title="6. Melden">
          <table className="rules__table">
            <thead>
              <tr>
                <th>Meldung</th>
                <th>Punkte</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Dreiblatt – 3 Karten in Folge, gleiche Farbe</td>
                <td>20</td>
              </tr>
              <tr>
                <td>Vierblatt – 4 Karten in Folge</td>
                <td>50</td>
              </tr>
              <tr>
                <td>Fünfblatt – 5 Karten in Folge</td>
                <td>100</td>
              </tr>
              <tr>
                <td>Vierling – vier 10er, Damen, Könige oder Asse</td>
                <td>100</td>
              </tr>
              <tr>
                <td>Vier Nell – alle vier 9er</td>
                <td>150</td>
              </tr>
              <tr>
                <td>Vier Buur – alle vier Bauern</td>
                <td>200</td>
              </tr>
              <tr>
                <td>Steck – Dame und König im Trumpf</td>
                <td>20</td>
              </tr>
            </tbody>
          </table>
          <p>
            <strong>Welches Team bekommt die Meldepunkte?</strong> Nur das Team mit der{' '}
            <strong>höchsten einzelnen Meldung</strong> erhält Meldepunkte – dann aber für <em>alle</em> seine
            Meldungen. Das andere Team erhält für seine Meldungen nichts.
          </p>
          <p>
            <strong>Was ist höher?</strong>
          </p>
          <ol>
            <li>Zuerst zählen die Punkte (z. B. Vierblatt 50 schlägt Dreiblatt 20).</li>
            <li>Bei gleichen Punkten schlägt das Fünfblatt den Vierling.</li>
            <li>
              Bei gleicher Art (z. B. beide ein Dreiblatt) gewinnt die <strong>höhere Karte</strong> – bei Folgen die
              höchste Karte der Folge, beim Vierling die Karte selbst. Die Farbe spielt keine Rolle.
            </li>
            <li>
              Sind beide Meldungen genau gleich hoch, gewinnt das <strong>Team, das den Trumpf hat</strong>.
            </li>
          </ol>
          <p>
            <strong>Mindestens ein Punkt:</strong> Meldepunkte zählen nur, wenn das Team in dieser Runde mindestens
            einen Kartenpunkt gemacht hat. Hat das Team mit der höchsten Meldung keinen Punkt gemacht, erhält
            stattdessen das andere Team seine Meldepunkte.
          </p>
          <p>
            <strong>Steck</strong> zählt immer – unabhängig von der höchsten Meldung und auch dann, wenn das Team keinen Punkt
            gemacht hat.
          </p>
        </Section>

        <Section title="7. Spielende & Siege">
          <p>
            Das Spiel endet, sobald ein Team <strong>{TARGET_SCORE} Punkte</strong> erreicht. Erreichen beide Teams in
            derselben Runde {TARGET_SCORE} Punkte, gewinnt das Team mit mehr Punkten; bei Gleichstand das Team, das in
            dieser Runde den Trumpf hatte.
          </p>
          <p>
            Das Gewinner-Team erhält <strong>1 Sieg</strong> – oder <strong>2 Siege</strong>, wenn das andere Team
            weniger als {DOUBLE_WIN_THRESHOLD} Punkte hat.
          </p>
        </Section>

        <Section title="8. So bedient ihr die Tafel">
          <ul>
            <li>
              <strong>Melden:</strong> Während der Runde tippt jedes Team auf seiner Hälfte auf «Melden» und wählt die
              Meldung – ein Tipp genügt. Falsch gemeldet? Mit dem ✕ an der Meldung wieder entfernen.
            </li>
            <li>
              <strong>Höchste Karte:</strong> Haben beide Teams als höchste Meldung die gleiche Art (z. B. beide ein
              Dreiblatt), erscheint ein geteilter Bildschirm: Jedes Team wählt auf seiner Seite seine höchste Karte. Mit
              «Später» kann man das verschieben, vor dem Eintragen der Punkte muss es aber gewählt sein.
            </li>
            <li>
              <strong>Punkte:</strong> Nach der Runde zählt ein Team seine Kartenpunkte und tippt sie unter «Punkte»
              ein. Die Punkte des anderen Teams ({ROUND_TOTAL} minus eure Punkte) und die Meldepunkte werden
              automatisch berechnet und angezeigt. Bei allen Stichen: «Match» ({MATCH_POINTS}). Mit «Bestätigen» wird
              alles eingetragen und die nächste Runde beginnt.
            </li>
            <li>
              <strong>Trumpf:</strong> Das Feld «Trumpf» wandert nach jeder Runde automatisch zum anderen Team.
            </li>
            <li>
              <strong>Siege:</strong> Neben der Runden-Anzeige sieht jedes Team seine Siege des Abends.
            </li>
            <li>
              <strong>Spielende:</strong> «Nächstes Spiel» startet das nächste Spiel, die Siege bleiben. Im Menü
              startet «Neuer Jass-Abend» ganz von vorne – Punkte <em>und</em> Siege werden gelöscht.
            </li>
            <li>
              <strong>Fehler korrigieren:</strong> Im Menü «Letzte Runde rückgängig». Dort seht ihr auch den Verlauf
              aller Runden.
            </li>
            <li>
              <strong>Teamnamen:</strong> Auf den Namen tippen, um ihn zu ändern.
            </li>
            <li>
              <strong>Bildschirm:</strong> Die Tafel bleibt eingeschaltet, solange sie offen ist. Nach 30 Sekunden
              ohne Berührung wechselt sie in eine schwarze Ansicht mit weissen Linien (schont OLED-Bildschirme) –
              alles bleibt bedienbar, ein Tipp bringt die Farben zurück.
            </li>
            <li>
              <strong>Speichern:</strong> Der Spielstand bleibt im Browser gespeichert, auch nach dem Neuladen der
              Seite.
            </li>
          </ul>
        </Section>
      </div>
    </Dialog>
  );
}
