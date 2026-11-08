const fs = require('fs')

let code = fs.readFileSync('src/pages/FavoritesPage.jsx', 'utf8')

// 1. Update Asma items to be clickable
const oldAsmaCard = `<div
                                            key={name.id}
                                            className="rounded-2xl p-4 flex flex-col gap-2 border transition-all hover:border-amber-500/50"
                                            style={{
                                                background: t(theme, 'surface-1'),
                                                borderColor: t(theme, 'border'),
                                            }}
                                        >`

const newAsmaCard = `<div
                                            key={name.id}
                                            onClick={() => navigate('/praise')}
                                            className="rounded-2xl p-4 flex flex-col gap-2 border transition-all hover:border-amber-500/50 cursor-pointer group active:scale-[0.98]"
                                            style={{
                                                background: t(theme, 'surface-1'),
                                                borderColor: t(theme, 'border'),
                                            }}
                                        >`

const oldAsmaToggle = `onClick={() => toggle({ id: \`asma-\${name.id}\`, type: 'asma' })}`
const newAsmaToggle = `onClick={(e) => { e.stopPropagation(); toggle({ id: \`asma-\${name.id}\`, type: 'asma' }); }}`

code = code.replace(oldAsmaCard, newAsmaCard)
code = code.replace(oldAsmaToggle, newAsmaToggle)

// 2. Add Tab Empty States after </section>\n                        )}\n                    </>
const tabEmptyStates = `
                        {/* ── Tab Empty States when a filter has 0 items ── */}
                        {activeTab === 'quran' && favAyahs.length === 0 && (
                            <div
                                className="rounded-3xl p-8 sm:p-12 text-center border flex flex-col items-center justify-center my-4 animate-fade-in"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    borderColor: t(theme, 'border'),
                                }}
                            >
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                                    style={{
                                        background: t(theme, 'accent-soft'),
                                        color: t(theme, 'accent'),
                                        border: \`1px solid \${t(theme, 'border')}\`
                                    }}
                                >
                                    <IconQuran size={22} />
                                </div>
                                <h3 className="text-base font-bold mb-1" style={{ color: t(theme, 'text-primary') }}>
                                    No bookmarked verses
                                </h3>
                                <p className="text-xs sm:text-sm opacity-65 max-w-xs leading-relaxed mb-5" style={{ color: t(theme, 'text-secondary') }}>
                                    Tap the bookmark icon on any ayah while reading the Qur’an to save it here.
                                </p>
                                <button
                                    onClick={() => navigate('/quran')}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2"
                                    style={{
                                        background: t(theme, 'accent'),
                                        color: activeTextCol,
                                        boxShadow: \`0 2px 8px \${t(theme, 'accent-glow')}\`
                                    }}
                                >
                                    <IconQuran size={15} />
                                    <span>Browse Qur'an</span>
                                </button>
                            </div>
                        )}

                        {activeTab === 'dua' && favDuas.length === 0 && (
                            <div
                                className="rounded-3xl p-8 sm:p-12 text-center border flex flex-col items-center justify-center my-4 animate-fade-in"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    borderColor: t(theme, 'border'),
                                }}
                            >
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                                    style={{
                                        background: t(theme, 'accent-soft'),
                                        color: t(theme, 'accent'),
                                        border: \`1px solid \${t(theme, 'border')}\`
                                    }}
                                >
                                    <IconHands size={22} />
                                </div>
                                <h3 className="text-base font-bold mb-1" style={{ color: t(theme, 'text-primary') }}>
                                    No bookmarked supplications
                                </h3>
                                <p className="text-xs sm:text-sm opacity-65 max-w-xs leading-relaxed mb-5" style={{ color: t(theme, 'text-secondary') }}>
                                    Bookmark daily prayers and prophetic supplications from the library to easily recite them here.
                                </p>
                                <button
                                    onClick={() => navigate('/library')}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2"
                                    style={{
                                        background: t(theme, 'accent'),
                                        color: activeTextCol,
                                        boxShadow: \`0 2px 8px \${t(theme, 'accent-glow')}\`
                                    }}
                                >
                                    <IconHands size={15} />
                                    <span>Explore Duas</span>
                                </button>
                            </div>
                        )}

                        {activeTab === 'asma' && favAsma.length === 0 && (
                            <div
                                className="rounded-3xl p-8 sm:p-12 text-center border flex flex-col items-center justify-center my-4 animate-fade-in"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    borderColor: t(theme, 'border'),
                                }}
                            >
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                                    style={{
                                        background: t(theme, 'accent-soft'),
                                        color: t(theme, 'accent'),
                                        border: \`1px solid \${t(theme, 'border')}\`
                                    }}
                                >
                                    <IconNinetyNine size={22} />
                                </div>
                                <h3 className="text-base font-bold mb-1" style={{ color: t(theme, 'text-primary') }}>
                                    No bookmarked divine names
                                </h3>
                                <p className="text-xs sm:text-sm opacity-65 max-w-xs leading-relaxed mb-5" style={{ color: t(theme, 'text-secondary') }}>
                                    Save beautiful names from Asma-ul-Husna to reflect upon and recite them here.
                                </p>
                                <button
                                    onClick={() => navigate('/praise')}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2"
                                    style={{
                                        background: t(theme, 'accent'),
                                        color: activeTextCol,
                                        boxShadow: \`0 2px 8px \${t(theme, 'accent-glow')}\`
                                    }}
                                >
                                    <IconNinetyNine size={15} />
                                    <span>Explore 99 Names</span>
                                </button>
                            </div>
                        )}`

const targetPattern = `                            </section>
                        )}
                    </>`

if (code.includes('</section>\n                        )}\n                    </>')) {
    code = code.replace('</section>\n                        )}\n                    </>', `</section>\n                        )}\n${tabEmptyStates}\n                    </>`)
} else if (code.includes('</section>\r\n                        )}\r\n                    </>')) {
    code = code.replace('</section>\r\n                        )}\r\n                    </>', `</section>\r\n                        )}\r\n${tabEmptyStates.replace(/\n/g, '\r\n')}\r\n                    </>`)
} else {
    console.log('Could not find closing section pattern');
}

fs.writeFileSync('src/pages/FavoritesPage.jsx', code, 'utf8')
console.log('Successfully updated FavoritesPage.jsx')
