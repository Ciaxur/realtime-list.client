import React from 'react';

export function ChangeLog() {
  return (
    <>
      {/* Generated using markdown Text to HTML on CHANGELOG.md */}
      <div className='app-changelog'>
      <strong>Version 1.1.1 (Minor Fixes)</strong>
      <ul>
        <li>[x] Fix trash sorting by last trashed</li>
        <li>[x] Read-Only List. Auth can modify and add</li>
      </ul>

      <strong>Version 1.1.0 (User Features)</strong>
      <ul>
        <li>[x] Dark Mode</li>
        <li>[x] Cookies</li>
        <li>[x] Trash (Recently Deleted Items, sort by Date)</li>
        <li>[x] Loading Indicator</li>
        <li>[x] Routes
          <ul>
            <li>Home | Changelog | About</li>
            <li>Add robots.txt</li>
          </ul>
        </li>
      </ul>

      <strong>Version 1.0.0 (Base Features)</strong>
      <ul>
        <li>[x] Start the Project <span aria-label='rocket' role='img'>🚀</span></li>
        <li>[x] Add <code>material-ui</code></li>
        <li>[x] Add Server Link to the README.md File, likewise other way</li>
        <li>[x] Better Colors and Styles <strong>UX</strong>

          <ul>
            <li>Random Color Borders (<em>Store on Server per Creation</em>)</li>
          </ul>
        </li>
        <li>[x] <span aria-label='bug' role='img'>🐞</span> Fix <strong>Add Item</strong> Overlapping and not Staying on very Bottom</li>
      </ul>

    </div>
    </>
  );
}