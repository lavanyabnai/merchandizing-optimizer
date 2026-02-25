"""
Assortment Optimizer CLI

Command-line interface for data management operations including:
- Seeding database with synthetic data
- Importing/exporting data from CSV/JSON files
- Data validation and integrity checks
- Backup and restore operations

Usage:
    python -m scripts.cli --help
    python -m scripts.cli seed --products 80 --stores 25 --weeks 52
    python -m scripts.cli import-data ./data/products.csv --type products
    python -m scripts.cli export-data --type all --output ./export
    python -m scripts.cli validate
    python -m scripts.cli backup --output ./backups
    python -m scripts.cli restore backup_20240115_120000.zip
    python -m scripts.cli clear --confirm
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

import click
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
from rich.table import Table
from rich.text import Text

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

console = Console()


def run_async(coro):
    """Helper to run async functions in click commands."""
    return asyncio.get_event_loop().run_until_complete(coro)


@click.group()
@click.version_option(version="1.0.0", prog_name="assortment-cli")
def cli():
    """
    Assortment Optimizer CLI - Data Management Tools

    Manage data for the Assortment Optimizer microservice including
    seeding, importing, exporting, validation, and backup operations.
    """
    pass


@cli.command()
@click.option("--products", default=80, help="Number of products to generate")
@click.option("--stores", default=25, help="Number of stores to generate")
@click.option("--weeks", default=52, help="Weeks of sales data to generate")
@click.option("--year", default=2024, help="Year for sales data")
@click.option("--seed", default=None, type=int, help="Random seed for reproducibility")
@click.option("--clear/--no-clear", default=False, help="Clear existing data before seeding")
def seed(products: int, stores: int, weeks: int, year: int, seed: Optional[int], clear: bool):
    """
    Seed database with synthetic data.

    Generates realistic beverage category data including products,
    stores, and sales transactions with seasonal patterns.

    Examples:
        python -m scripts.cli seed
        python -m scripts.cli seed --products 100 --stores 30
        python -m scripts.cli seed --clear --seed 42
    """
    console.print(Panel.fit(
        "[bold blue]Assortment Optimizer - Data Seeding[/bold blue]",
        subtitle="Generating synthetic data"
    ))

    async def _seed():
        from app.db.database import get_db_session_context
        from app.services.data_generator import DataGeneratorService

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TaskProgressColumn(),
            console=console,
        ) as progress:
            # Initialize
            task = progress.add_task("[cyan]Initializing...", total=100)

            async with get_db_session_context() as session:
                generator = DataGeneratorService(session, random_seed=seed)

                if clear:
                    progress.update(task, description="[yellow]Clearing existing data...")
                    await generator.clear_all_data()
                    progress.update(task, advance=10)

                # Generate data
                progress.update(task, description="[cyan]Generating products...")
                products_data = generator.generate_products(num_products=products)
                progress.update(task, advance=20)

                progress.update(task, description="[cyan]Generating stores...")
                stores_data = generator.generate_stores(num_stores=stores)
                progress.update(task, advance=20)

                progress.update(task, description="[cyan]Generating sales data...")
                # This will be done in seed_all_data
                progress.update(task, advance=10)

                progress.update(task, description="[cyan]Inserting into database...")
                result = await generator.seed_all_data(
                    num_products=products,
                    num_stores=stores,
                    weeks=weeks,
                    year=year,
                )
                progress.update(task, advance=40)

        # Display results
        table = Table(title="Seeding Results", show_header=True, header_style="bold magenta")
        table.add_column("Entity", style="cyan")
        table.add_column("Count", justify="right", style="green")

        table.add_row("Products", str(result.get("products_created", 0)))
        table.add_row("Stores", str(result.get("stores_created", 0)))
        table.add_row("Sales Records", str(result.get("sales_records_created", 0)))
        table.add_row("Switching Matrix Entries", str(result.get("switching_matrix_entries", 0)))

        console.print(table)
        console.print("\n[bold green]✓ Seeding completed successfully![/bold green]")

    try:
        run_async(_seed())
    except Exception as e:
        console.print(f"[bold red]✗ Error during seeding: {e}[/bold red]")
        raise click.Abort()


@cli.command("import-data")
@click.argument("file_path", type=click.Path(exists=True))
@click.option(
    "--type", "data_type",
    type=click.Choice(["products", "stores", "sales"]),
    required=True,
    help="Type of data to import"
)
@click.option("--validate/--no-validate", default=True, help="Validate data before import")
@click.option("--dry-run", is_flag=True, help="Validate without importing")
def import_data(file_path: str, data_type: str, validate: bool, dry_run: bool):
    """
    Import data from CSV or JSON file.

    Supports importing products, stores, or sales data from
    CSV or JSON format files.

    Examples:
        python -m scripts.cli import-data ./data/products.csv --type products
        python -m scripts.cli import-data ./data/stores.json --type stores
        python -m scripts.cli import-data ./data/sales.csv --type sales --dry-run
    """
    file_path = Path(file_path)
    file_ext = file_path.suffix.lower()

    console.print(Panel.fit(
        f"[bold blue]Importing {data_type}[/bold blue]",
        subtitle=f"From: {file_path.name}"
    ))

    async def _import():
        from app.utils.file_parser import FileParser
        from app.utils.data_validator import DataValidator
        from app.db.database import get_db_session_context
        from app.db.repository import get_repositories

        # Parse file
        console.print("[cyan]Parsing file...[/cyan]")
        parser = FileParser()

        if file_ext == ".csv":
            data, errors = parser.parse_csv(file_path, data_type)
        elif file_ext == ".json":
            data, errors = parser.parse_json(file_path, data_type)
        else:
            console.print(f"[red]Unsupported file format: {file_ext}[/red]")
            raise click.Abort()

        if errors:
            console.print("[yellow]Parse warnings:[/yellow]")
            for err in errors[:10]:
                console.print(f"  - {err}")
            if len(errors) > 10:
                console.print(f"  ... and {len(errors) - 10} more")

        console.print(f"[green]Parsed {len(data)} records[/green]")

        # Validate
        if validate:
            console.print("[cyan]Validating data...[/cyan]")
            validator = DataValidator()

            if data_type == "products":
                validation_result = validator.validate_products(data)
            elif data_type == "stores":
                validation_result = validator.validate_stores(data)
            else:
                validation_result = validator.validate_sales(data)

            if not validation_result.is_valid:
                console.print("[red]Validation failed:[/red]")
                for err in validation_result.errors[:10]:
                    console.print(f"  - {err}")
                if len(validation_result.errors) > 10:
                    console.print(f"  ... and {len(validation_result.errors) - 10} more")
                raise click.Abort()

            console.print("[green]Validation passed[/green]")

        if dry_run:
            console.print("\n[yellow]Dry run - no data imported[/yellow]")
            return

        # Import to database
        console.print("[cyan]Importing to database...[/cyan]")

        async with get_db_session_context() as session:
            repos = get_repositories(session)

            if data_type == "products":
                from app.db.models import AssortmentProduct
                records = [AssortmentProduct(**item) for item in data]
                await repos.products.create_many(records)
                count = len(records)
            elif data_type == "stores":
                from app.db.models import AssortmentStore
                records = [AssortmentStore(**item) for item in data]
                await repos.stores.create_many(records)
                count = len(records)
            else:  # sales
                from app.db.models import AssortmentSale
                # Need to resolve SKU/store_code to IDs
                product_map = {}
                store_map = {}

                products = await repos.products.get_all(limit=10000)
                for p in products:
                    product_map[p.sku] = p.id

                stores = await repos.stores.get_all(limit=1000)
                for s in stores:
                    store_map[s.store_code] = s.id

                sales_records = []
                for item in data:
                    sku = item.pop("sku", None)
                    store_code = item.pop("store_code", None)

                    if sku and sku in product_map:
                        item["product_id"] = product_map[sku]
                    if store_code and store_code in store_map:
                        item["store_id"] = store_map[store_code]

                    if "product_id" in item and "store_id" in item:
                        sales_records.append(AssortmentSale(**item))

                await repos.sales.create_many(sales_records)
                count = len(sales_records)

        console.print(f"\n[bold green]✓ Imported {count} {data_type} records[/bold green]")

    try:
        run_async(_import())
    except Exception as e:
        console.print(f"[bold red]✗ Error during import: {e}[/bold red]")
        raise click.Abort()


@cli.command("export-data")
@click.option(
    "--type", "data_type",
    type=click.Choice(["products", "stores", "sales", "all"]),
    default="all",
    help="Type of data to export"
)
@click.option("--output", "-o", default="./export", help="Output directory")
@click.option("--format", "file_format", type=click.Choice(["json", "csv"]), default="json")
def export_data(data_type: str, output: str, file_format: str):
    """
    Export data to JSON or CSV files.

    Exports products, stores, sales, or all data to the specified
    output directory.

    Examples:
        python -m scripts.cli export-data --type products --output ./export
        python -m scripts.cli export-data --type all --format csv
    """
    output_dir = Path(output)
    output_dir.mkdir(parents=True, exist_ok=True)

    console.print(Panel.fit(
        f"[bold blue]Exporting {data_type}[/bold blue]",
        subtitle=f"To: {output_dir}"
    ))

    async def _export():
        from app.db.database import get_db_session_context
        from app.db.repository import get_repositories
        from app.utils.transformers import DataTransformers

        async with get_db_session_context() as session:
            repos = get_repositories(session)
            transformers = DataTransformers()
            exported = []

            types_to_export = ["products", "stores", "sales"] if data_type == "all" else [data_type]

            for dtype in types_to_export:
                console.print(f"[cyan]Exporting {dtype}...[/cyan]")

                if dtype == "products":
                    data = await repos.products.get_all(limit=100000)
                    data_dicts = [transformers.product_to_dict(p) for p in data]
                elif dtype == "stores":
                    data = await repos.stores.get_all(limit=10000)
                    data_dicts = [transformers.store_to_dict(s) for s in data]
                else:
                    data = await repos.sales.get_all(limit=1000000)
                    data_dicts = [transformers.sale_to_dict(s) for s in data]

                # Write file
                if file_format == "json":
                    file_path = output_dir / f"{dtype}.json"
                    with open(file_path, "w") as f:
                        json.dump(data_dicts, f, indent=2, default=str)
                else:
                    file_path = output_dir / f"{dtype}.csv"
                    transformers.to_csv(data_dicts, file_path)

                exported.append((dtype, len(data_dicts), file_path))

        # Display results
        table = Table(title="Export Results", show_header=True, header_style="bold magenta")
        table.add_column("Type", style="cyan")
        table.add_column("Records", justify="right", style="green")
        table.add_column("File", style="dim")

        for dtype, count, fpath in exported:
            table.add_row(dtype, str(count), str(fpath))

        console.print(table)
        console.print("\n[bold green]✓ Export completed successfully![/bold green]")

    try:
        run_async(_export())
    except Exception as e:
        console.print(f"[bold red]✗ Error during export: {e}[/bold red]")
        raise click.Abort()


@cli.command()
@click.confirmation_option(prompt="Are you sure you want to clear ALL data?")
def clear():
    """
    Clear all data from the database.

    This will permanently delete all products, stores, sales,
    optimization runs, and other data. Use with caution!

    Examples:
        python -m scripts.cli clear
    """
    console.print(Panel.fit(
        "[bold red]WARNING: Clearing All Data[/bold red]",
        subtitle="This action cannot be undone"
    ))

    async def _clear():
        from app.db.database import get_db_session_context
        from app.services.data_generator import DataGeneratorService

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            task = progress.add_task("[red]Clearing data...", total=None)

            async with get_db_session_context() as session:
                generator = DataGeneratorService(session)
                await generator.clear_all_data()

            progress.update(task, description="[green]Data cleared")

        console.print("\n[bold green]✓ All data has been cleared![/bold green]")

    try:
        run_async(_clear())
    except Exception as e:
        console.print(f"[bold red]✗ Error during clear: {e}[/bold red]")
        raise click.Abort()


@cli.command()
@click.option("--fix", is_flag=True, help="Attempt to fix validation errors")
def validate():
    """
    Validate data integrity.

    Checks for:
    - Required fields
    - Valid enum values
    - Referential integrity (sales -> products/stores)
    - Data consistency

    Examples:
        python -m scripts.cli validate
        python -m scripts.cli validate --fix
    """
    console.print(Panel.fit(
        "[bold blue]Data Validation[/bold blue]",
        subtitle="Checking data integrity"
    ))

    async def _validate():
        from app.db.database import get_db_session_context
        from app.db.repository import get_repositories
        from app.utils.data_validator import DataValidator

        async with get_db_session_context() as session:
            repos = get_repositories(session)
            validator = DataValidator()

            results = []

            # Validate products
            console.print("[cyan]Validating products...[/cyan]")
            products = await repos.products.get_all(limit=100000)
            product_result = validator.validate_products(
                [{"sku": p.sku, "name": p.name, "brand": p.brand, "brand_tier": p.brand_tier.value,
                  "price": float(p.price), "cost": float(p.cost)} for p in products]
            )
            results.append(("Products", len(products), product_result))

            # Validate stores
            console.print("[cyan]Validating stores...[/cyan]")
            stores = await repos.stores.get_all(limit=10000)
            store_result = validator.validate_stores(
                [{"store_code": s.store_code, "name": s.name, "format": s.format.value,
                  "location_type": s.location_type.value} for s in stores]
            )
            results.append(("Stores", len(stores), store_result))

            # Validate referential integrity
            console.print("[cyan]Validating referential integrity...[/cyan]")
            sales_count = await repos.sales.count()
            integrity_result = await validator.validate_referential_integrity(session)
            results.append(("Referential Integrity", sales_count, integrity_result))

        # Display results
        table = Table(title="Validation Results", show_header=True, header_style="bold magenta")
        table.add_column("Check", style="cyan")
        table.add_column("Records", justify="right")
        table.add_column("Status", justify="center")
        table.add_column("Errors", justify="right")

        all_valid = True
        for name, count, result in results:
            status = "[green]✓[/green]" if result.is_valid else "[red]✗[/red]"
            if not result.is_valid:
                all_valid = False
            table.add_row(name, str(count), status, str(len(result.errors)))

        console.print(table)

        # Show errors if any
        for name, count, result in results:
            if not result.is_valid:
                console.print(f"\n[yellow]{name} errors:[/yellow]")
                for err in result.errors[:5]:
                    console.print(f"  - {err}")
                if len(result.errors) > 5:
                    console.print(f"  ... and {len(result.errors) - 5} more")

        if all_valid:
            console.print("\n[bold green]✓ All validation checks passed![/bold green]")
        else:
            console.print("\n[bold yellow]⚠ Some validation issues found[/bold yellow]")

    try:
        run_async(_validate())
    except Exception as e:
        console.print(f"[bold red]✗ Error during validation: {e}[/bold red]")
        raise click.Abort()


@cli.command()
@click.option("--output", "-o", default="./backups", help="Output directory for backup")
@click.option("--compress/--no-compress", default=True, help="Compress backup to zip")
def backup(output: str, compress: bool):
    """
    Create database backup.

    Exports all data to JSON files with metadata, optionally
    compressed to a zip archive.

    Examples:
        python -m scripts.cli backup
        python -m scripts.cli backup --output ./my-backups
        python -m scripts.cli backup --no-compress
    """
    output_dir = Path(output)
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"backup_{timestamp}"

    console.print(Panel.fit(
        "[bold blue]Creating Backup[/bold blue]",
        subtitle=f"To: {output_dir / backup_name}"
    ))

    async def _backup():
        from app.db.database import get_db_session_context
        from app.db.repository import get_repositories
        from app.utils.transformers import DataTransformers
        import zipfile

        backup_dir = output_dir / backup_name
        backup_dir.mkdir(parents=True, exist_ok=True)

        async with get_db_session_context() as session:
            repos = get_repositories(session)
            transformers = DataTransformers()

            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                TaskProgressColumn(),
                console=console,
            ) as progress:
                task = progress.add_task("[cyan]Backing up...", total=100)

                # Backup metadata
                metadata = {
                    "timestamp": timestamp,
                    "version": "1.0.0",
                    "created_at": datetime.now().isoformat(),
                }

                # Backup products
                progress.update(task, description="[cyan]Backing up products...")
                products = await repos.products.get_all(limit=100000)
                products_data = [transformers.product_to_dict(p) for p in products]
                metadata["products_count"] = len(products_data)
                progress.update(task, advance=25)

                # Backup stores
                progress.update(task, description="[cyan]Backing up stores...")
                stores = await repos.stores.get_all(limit=10000)
                stores_data = [transformers.store_to_dict(s) for s in stores]
                metadata["stores_count"] = len(stores_data)
                progress.update(task, advance=25)

                # Backup sales
                progress.update(task, description="[cyan]Backing up sales...")
                sales = await repos.sales.get_all(limit=1000000)
                sales_data = [transformers.sale_to_dict(s) for s in sales]
                metadata["sales_count"] = len(sales_data)
                progress.update(task, advance=25)

                # Write files
                progress.update(task, description="[cyan]Writing files...")

                with open(backup_dir / "metadata.json", "w") as f:
                    json.dump(metadata, f, indent=2, default=str)
                with open(backup_dir / "products.json", "w") as f:
                    json.dump(products_data, f, indent=2, default=str)
                with open(backup_dir / "stores.json", "w") as f:
                    json.dump(stores_data, f, indent=2, default=str)
                with open(backup_dir / "sales.json", "w") as f:
                    json.dump(sales_data, f, indent=2, default=str)

                progress.update(task, advance=25)

        # Compress if requested
        if compress:
            console.print("[cyan]Compressing backup...[/cyan]")
            zip_path = output_dir / f"{backup_name}.zip"
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
                for file_path in backup_dir.iterdir():
                    zipf.write(file_path, file_path.name)

            # Remove uncompressed directory
            import shutil
            shutil.rmtree(backup_dir)

            console.print(f"\n[bold green]✓ Backup created: {zip_path}[/bold green]")
        else:
            console.print(f"\n[bold green]✓ Backup created: {backup_dir}[/bold green]")

        # Display summary
        table = Table(title="Backup Summary", show_header=True, header_style="bold magenta")
        table.add_column("Entity", style="cyan")
        table.add_column("Records", justify="right", style="green")

        table.add_row("Products", str(metadata["products_count"]))
        table.add_row("Stores", str(metadata["stores_count"]))
        table.add_row("Sales", str(metadata["sales_count"]))

        console.print(table)

    try:
        run_async(_backup())
    except Exception as e:
        console.print(f"[bold red]✗ Error during backup: {e}[/bold red]")
        raise click.Abort()


@cli.command()
@click.argument("backup_file", type=click.Path(exists=True))
@click.option("--clear/--no-clear", default=True, help="Clear existing data before restore")
def restore(backup_file: str, clear: bool):
    """
    Restore from backup.

    Restores data from a backup file (zip or directory).

    Examples:
        python -m scripts.cli restore ./backups/backup_20240115_120000.zip
        python -m scripts.cli restore ./backups/backup_20240115_120000 --no-clear
    """
    backup_path = Path(backup_file)

    console.print(Panel.fit(
        "[bold blue]Restoring from Backup[/bold blue]",
        subtitle=f"From: {backup_path}"
    ))

    async def _restore():
        from app.db.database import get_db_session_context
        from app.db.repository import get_repositories
        from app.db.models import AssortmentProduct, AssortmentStore, AssortmentSale
        from app.services.data_generator import DataGeneratorService
        import zipfile
        import tempfile
        import shutil

        # Handle zip file
        if backup_path.suffix == ".zip":
            temp_dir = tempfile.mkdtemp()
            with zipfile.ZipFile(backup_path, "r") as zipf:
                zipf.extractall(temp_dir)
            data_dir = Path(temp_dir)
        else:
            data_dir = backup_path
            temp_dir = None

        try:
            # Read metadata
            metadata_path = data_dir / "metadata.json"
            if not metadata_path.exists():
                console.print("[red]Invalid backup: missing metadata.json[/red]")
                raise click.Abort()

            with open(metadata_path) as f:
                metadata = json.load(f)

            console.print(f"[dim]Backup from: {metadata.get('created_at', 'Unknown')}[/dim]")
            console.print(f"[dim]Version: {metadata.get('version', 'Unknown')}[/dim]")

            async with get_db_session_context() as session:
                repos = get_repositories(session)

                with Progress(
                    SpinnerColumn(),
                    TextColumn("[progress.description]{task.description}"),
                    BarColumn(),
                    TaskProgressColumn(),
                    console=console,
                ) as progress:
                    task = progress.add_task("[cyan]Restoring...", total=100)

                    # Clear existing data if requested
                    if clear:
                        progress.update(task, description="[yellow]Clearing existing data...")
                        generator = DataGeneratorService(session)
                        await generator.clear_all_data()
                        progress.update(task, advance=10)

                    # Restore products
                    progress.update(task, description="[cyan]Restoring products...")
                    with open(data_dir / "products.json") as f:
                        products_data = json.load(f)
                    products = [AssortmentProduct(**p) for p in products_data]
                    await repos.products.create_many(products)
                    progress.update(task, advance=30)

                    # Restore stores
                    progress.update(task, description="[cyan]Restoring stores...")
                    with open(data_dir / "stores.json") as f:
                        stores_data = json.load(f)
                    stores = [AssortmentStore(**s) for s in stores_data]
                    await repos.stores.create_many(stores)
                    progress.update(task, advance=30)

                    # Restore sales
                    progress.update(task, description="[cyan]Restoring sales...")
                    with open(data_dir / "sales.json") as f:
                        sales_data = json.load(f)
                    # Batch insert sales
                    batch_size = 5000
                    for i in range(0, len(sales_data), batch_size):
                        batch = sales_data[i:i + batch_size]
                        sales = [AssortmentSale(**s) for s in batch]
                        await repos.sales.create_many(sales)
                    progress.update(task, advance=30)

            console.print("\n[bold green]✓ Restore completed successfully![/bold green]")

            # Display summary
            table = Table(title="Restore Summary", show_header=True, header_style="bold magenta")
            table.add_column("Entity", style="cyan")
            table.add_column("Records", justify="right", style="green")

            table.add_row("Products", str(len(products_data)))
            table.add_row("Stores", str(len(stores_data)))
            table.add_row("Sales", str(len(sales_data)))

            console.print(table)

        finally:
            # Cleanup temp directory
            if temp_dir:
                shutil.rmtree(temp_dir)

    try:
        run_async(_restore())
    except Exception as e:
        console.print(f"[bold red]✗ Error during restore: {e}[/bold red]")
        raise click.Abort()


@cli.command()
def stats():
    """
    Display database statistics.

    Shows counts and summaries of all data in the database.

    Examples:
        python -m scripts.cli stats
    """
    console.print(Panel.fit(
        "[bold blue]Database Statistics[/bold blue]",
        subtitle="Current data summary"
    ))

    async def _stats():
        from app.db.database import get_db_session_context
        from app.db.repository import get_repositories

        async with get_db_session_context() as session:
            repos = get_repositories(session)

            # Get counts
            products_count = await repos.products.count()
            stores_count = await repos.stores.count()
            sales_count = await repos.sales.count()

            # Get subcategory breakdown
            products = await repos.products.get_all(limit=100000)
            subcategories = {}
            for p in products:
                subcategories[p.subcategory] = subcategories.get(p.subcategory, 0) + 1

            # Get store format breakdown
            stores = await repos.stores.get_all(limit=10000)
            formats = {}
            for s in stores:
                formats[s.format.value] = formats.get(s.format.value, 0) + 1

        # Display main stats
        table = Table(title="Data Counts", show_header=True, header_style="bold magenta")
        table.add_column("Entity", style="cyan")
        table.add_column("Count", justify="right", style="green")

        table.add_row("Products", str(products_count))
        table.add_row("Stores", str(stores_count))
        table.add_row("Sales Records", str(sales_count))

        console.print(table)

        # Subcategory breakdown
        if subcategories:
            console.print()
            sub_table = Table(title="Products by Subcategory", show_header=True)
            sub_table.add_column("Subcategory", style="cyan")
            sub_table.add_column("Count", justify="right", style="green")
            for subcat, count in sorted(subcategories.items()):
                sub_table.add_row(subcat, str(count))
            console.print(sub_table)

        # Store format breakdown
        if formats:
            console.print()
            format_table = Table(title="Stores by Format", show_header=True)
            format_table.add_column("Format", style="cyan")
            format_table.add_column("Count", justify="right", style="green")
            for fmt, count in sorted(formats.items()):
                format_table.add_row(fmt, str(count))
            console.print(format_table)

    try:
        run_async(_stats())
    except Exception as e:
        console.print(f"[bold red]✗ Error getting stats: {e}[/bold red]")
        raise click.Abort()


if __name__ == "__main__":
    cli()
