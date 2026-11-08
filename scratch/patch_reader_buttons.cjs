const fs = require('fs');

let code = fs.readFileSync('src/pages/SurahReaderPage.jsx', 'utf8');

// Replace the action bar in translation view
const oldActionBarRegex = /{\/\* Actions: Recite, Copy, Favorite \*\/}[\s\S]*?{\/\* Arabic Verse Text \*\/}/;

const newActionBar = `{/* Actions: Copy & Like right beside each other */}
                                        <div className="flex items-center gap-1.5">
                                            {/* Copy */}
                                            <button
                                                onClick={() => handleCopy(ayah)}
                                                className="p-2 rounded-xl transition-all active:scale-90 flex items-center justify-center hover:opacity-100"
                                                style={{
                                                    background: t(theme, 'surface-2'),
                                                    color: isCopied ? t(theme, 'accent') : t(theme, 'text-secondary'),
                                                    border: \`1px solid \${t(theme, 'border')}\`,
                                                }}
                                                title="Copy Ayah text and translation"
                                                aria-label="Copy Ayah"
                                            >
                                                {isCopied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                            </button>

                                            {/* Bookmark / Favorite */}
                                            <button
                                                onClick={() => toggle({
                                                    id: ayahKey,
                                                    type: 'ayah',
                                                    surahNumber: surah.number,
                                                    ayahNumber: ayah.numberInSurah,
                                                    surahName: surah.englishName,
                                                    text: cleanText,
                                                    translation: ayah.translation,
                                                    transliteration: ayah.transliteration,
                                                })}
                                                className="p-2 rounded-xl transition-all active:scale-90 flex items-center justify-center hover:opacity-100"
                                                style={{
                                                    background: isFav ? t(theme, 'accent-soft') : t(theme, 'surface-2'),
                                                    color: isFav ? t(theme, 'accent') : t(theme, 'text-secondary'),
                                                    border: \`1px solid \${isFav ? t(theme, 'accent') : t(theme, 'border')}\`,
                                                }}
                                                title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
                                                aria-label="Bookmark Ayah"
                                            >
                                                {isFav ? <IconHeartFill size={16} /> : <IconHeart size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Arabic Verse Text */}`;

code = code.replace(oldActionBarRegex, newActionBar);

// Replace translation section with fitted container having both transliteration and translation
const oldTransRegex = /{\/\* English Translation \*\/}[\s\S]*?<\/article>/;

const newTrans = `{/* Transliteration & Translation Container */}
                                    {(ayah.transliteration || ayah.translation) && (
                                        <div
                                            className="mt-4 rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col gap-2.5 transition-all text-left"
                                            style={{
                                                background: t(theme, 'surface-2'),
                                                border: \`1px solid \${t(theme, 'border')}\`,
                                            }}
                                        >
                                            {/* Transliteration */}
                                            {ayah.transliteration && (
                                                <p
                                                    className="text-[13px] sm:text-[14.5px] leading-relaxed italic font-serif select-text"
                                                    style={{
                                                        color: t(theme, 'accent'),
                                                        fontFamily: 'var(--font-serif-body)',
                                                    }}
                                                >
                                                    {ayah.transliteration}
                                                </p>
                                            )}

                                            {ayah.transliteration && ayah.translation && (
                                                <div className="h-px w-full" style={{ background: t(theme, 'border'), opacity: 0.5 }} />
                                            )}

                                            {/* English Translation */}
                                            {ayah.translation && (
                                                <p
                                                    className="text-[14px] sm:text-[15.5px] leading-relaxed font-normal select-text opacity-90"
                                                    style={{
                                                        color: t(theme, 'text-primary'),
                                                        fontFamily: 'var(--font-sans)',
                                                    }}
                                                >
                                                    {ayah.translation}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </article>`;

code = code.replace(oldTransRegex, newTrans);

// Also remove sound button from Mushaf tray
const oldTrayControlsRegex = /<div className="flex items-center gap-2">[\s\S]*?<button[\s\S]*?speak\(getCleanAyahText\(selectedAyah\)[\s\S]*?<\/button>/;

const newTrayControls = `<div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggle({
                                        id: \`ayah-\${surah.number}-\${selectedAyah.numberInSurah}\`,
                                        type: 'ayah',
                                        surahNumber: surah.number,
                                        ayahNumber: selectedAyah.numberInSurah,
                                        surahName: surah.englishName,
                                        text: getCleanAyahText(selectedAyah),
                                        translation: selectedAyah.translation,
                                        transliteration: selectedAyah.transliteration,
                                    })}
                                    className="p-1.5 rounded-lg text-xs"
                                    style={{
                                        background: isFavorite(\`ayah-\${surah.number}-\${selectedAyah.numberInSurah}\`) ? t(theme, 'accent-soft') : t(theme, 'surface-2'),
                                        color: isFavorite(\`ayah-\${surah.number}-\${selectedAyah.numberInSurah}\`) ? t(theme, 'accent') : t(theme, 'text-primary'),
                                    }}
                                    title="Bookmark Ayah"
                                >
                                    {isFavorite(\`ayah-\${surah.number}-\${selectedAyah.numberInSurah}\`) ? <IconHeartFill size={15} /> : <IconHeart size={15} />}
                                </button>`;

code = code.replace(oldTrayControlsRegex, newTrayControls);

// Also add transliteration to the Mushaf tray body
code = code.replace(
    `<p className="text-xs sm:text-sm leading-relaxed" style={{ color: t(theme, 'text-secondary') }}>
                            {selectedAyah.translation}
                        </p>`,
    `{selectedAyah.transliteration && (
                            <p className="text-xs italic font-serif mb-1.5" style={{ color: t(theme, 'accent') }}>
                                {selectedAyah.transliteration}
                            </p>
                        )}
                        <p className="text-xs sm:text-sm leading-relaxed" style={{ color: t(theme, 'text-secondary') }}>
                            {selectedAyah.translation}
                        </p>`
);

fs.writeFileSync('src/pages/SurahReaderPage.jsx', code, 'utf8');
console.log('Successfully updated SurahReaderPage with transliteration, container, and button cluster!');

